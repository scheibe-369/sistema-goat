
import { supabase } from "@/integrations/supabase/client";

export const generateFinancialEntriesForClient = async (clientId: string, userId: string) => {
  try {
    console.log('DEBUG - Gerando lançamentos financeiros para cliente:', clientId);

    // Buscar dados do cliente e contrato
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

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .single();

    if (contractError || !contract) {
      console.error('Erro ao buscar contrato:', contractError);
      return;
    }

    // Verificar se já existem lançamentos para este cliente
    const { data: existingEntries } = await supabase
      .from('finances')
      .select('id')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .eq('type', 'income');

    if (existingEntries && existingEntries.length > 0) {
      console.log('DEBUG - Lançamentos já existem para este cliente');
      return;
    }

    // Gerar todos os lançamentos futuros
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);
    const paymentDay = client.payment_day || 1;
    
    const financialEntries = [];
    let currentDate = new Date(startDate);
    
    // Ajustar para o primeiro dia de pagamento
    currentDate.setDate(paymentDay);
    
    // Se o dia de pagamento já passou no mês inicial, ir para o próximo mês
    if (currentDate < startDate) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Gerar lançamentos mensais até o fim do contrato
    while (currentDate <= endDate) {
      const entryDate = currentDate.toISOString().split('T')[0];
      
      financialEntries.push({
        description: `Pagamento mensal - ${client.company}`,
        amount: contract.monthly_value,
        category: 'Receita',
        date: entryDate,
        status: 'pending',
        type: 'income',
        user_id: userId,
        client_id: clientId,
      });

      // Próximo mês
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    if (financialEntries.length > 0) {
      console.log(`DEBUG - Criando ${financialEntries.length} lançamentos financeiros`);
      
      const { error: insertError } = await supabase
        .from('finances')
        .insert(financialEntries);

      if (insertError) {
        console.error('Erro ao inserir lançamentos financeiros:', insertError);
      } else {
        console.log('DEBUG - Lançamentos financeiros criados com sucesso');
      }
    }

  } catch (error) {
    console.error('Erro ao gerar lançamentos financeiros:', error);
  }
};
