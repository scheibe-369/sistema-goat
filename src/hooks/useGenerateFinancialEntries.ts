
import { supabase } from "@/integrations/supabase/client";

export const generateFinancialEntriesForClient = async (clientId: string, userId: string) => {
  try {
    console.log('DEBUG - Gerando lançamentos financeiros para cliente:', clientId);

    // Buscar dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      console.error('Erro ao buscar cliente:', clientError);
      return;
    }

    // Verificar se o cliente tem dados necessários para gerar lançamentos
    if (!client.monthly_value || !client.contract_end || !client.payment_day) {
      console.log('DEBUG - Cliente não tem dados suficientes para gerar lançamentos financeiros');
      return;
    }

    // Verificar se já existem lançamentos para este cliente
    const { data: existingEntries } = await supabase
      .from('financial_entries')
      .select('id')
      .eq('client_id', clientId)
      .eq('user_id', userId);

    if (existingEntries && existingEntries.length > 0) {
      console.log('DEBUG - Lançamentos já existem para este cliente');
      return;
    }

    // Gerar todos os lançamentos futuros
    const startDate = new Date(client.start_date || new Date());
    const endDate = new Date(client.contract_end);
    const paymentDay = client.payment_day || 1;
    
    const financialEntries = [];
    
    // Começar do mês seguinte ao início do contrato ou do mesmo mês se o dia de pagamento ainda não passou
    let currentDate = new Date(startDate);
    
    // Se o dia de pagamento do mês atual já passou, começar do próximo mês
    if (startDate.getDate() >= paymentDay) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Ajustar para o dia de pagamento
    currentDate.setDate(paymentDay);

    // Gerar lançamentos mensais até o fim do contrato
    while (currentDate <= endDate) {
      // Usar formatação local para evitar problemas de timezone
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const entryDate = `${year}-${month}-${day}`;
      
      // Criar referência do mês/ano em português
      const monthNames = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const reference = `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
      
      financialEntries.push({
        client_id: clientId,
        user_id: userId,
        name: client.company,
        amount: client.monthly_value,
        due_date: entryDate,
        reference: reference,
        status: 'pending',
      });

      // Próximo mês
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    if (financialEntries.length > 0) {
      console.log(`DEBUG - Criando ${financialEntries.length} lançamentos financeiros`);
      
      const { error: insertError } = await supabase
        .from('financial_entries')
        .insert(financialEntries);

      if (insertError) {
        console.error('Erro ao inserir lançamentos financeiros:', insertError);
        throw insertError;
      } else {
        console.log('DEBUG - Lançamentos financeiros criados com sucesso');
      }
    }

  } catch (error) {
    console.error('Erro ao gerar lançamentos financeiros:', error);
    throw error;
  }
};

// Função para atualizar lançamentos quando cliente for editado
export const updateFinancialEntriesForClient = async (clientId: string, userId: string) => {
  try {
    console.log('DEBUG - Atualizando lançamentos financeiros para cliente:', clientId);

    // Remover lançamentos futuros (não pagos)
    await supabase
      .from('financial_entries')
      .delete()
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Gerar novos lançamentos
    await generateFinancialEntriesForClient(clientId, userId);

  } catch (error) {
    console.error('Erro ao atualizar lançamentos financeiros:', error);
    throw error;
  }
};
