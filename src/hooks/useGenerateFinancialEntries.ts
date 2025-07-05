
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
      const entryDate = currentDate.toISOString().split('T')[0];
      
      // Criar referência do mês/ano em português
      const monthNames = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const reference = `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
      
      financialEntries.push({
        description: client.company, // Apenas o nome do cliente
        amount: contract.monthly_value,
        category: reference, // Usar category para armazenar a referência mês/ano
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

// Nova função para gerar próximo lançamento após confirmação de pagamento
export const generateNextFinancialEntry = async (currentEntry: any, userId: string) => {
  try {
    console.log('DEBUG - Gerando próximo lançamento após pagamento:', currentEntry);

    // Buscar dados do cliente e contrato
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', currentEntry.client_id)
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      console.error('Erro ao buscar cliente:', clientError);
      return;
    }

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('client_id', currentEntry.client_id)
      .eq('user_id', userId)
      .single();

    if (contractError || !contract) {
      console.error('Erro ao buscar contrato:', contractError);
      return;
    }

    // Calcular próxima data de pagamento
    const currentDate = new Date(currentEntry.date);
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    const endDate = new Date(contract.end_date);
    
    // Verificar se a próxima data está dentro do período do contrato
    if (nextDate <= endDate) {
      // Verificar se já existe lançamento para esta data
      const { data: existingEntry } = await supabase
        .from('finances')
        .select('id')
        .eq('client_id', currentEntry.client_id)
        .eq('user_id', userId)
        .eq('date', nextDate.toISOString().split('T')[0])
        .eq('type', 'income')
        .single();

      if (!existingEntry) {
        // Criar referência do mês/ano em português
        const monthNames = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const reference = `${monthNames[nextDate.getMonth()]} de ${nextDate.getFullYear()}`;
        
        const { error: insertError } = await supabase
          .from('finances')
          .insert({
            description: client.company, // Apenas o nome do cliente
            amount: contract.monthly_value,
            category: reference, // Usar category para armazenar a referência mês/ano
            date: nextDate.toISOString().split('T')[0],
            status: 'pending',
            type: 'income',
            user_id: userId,
            client_id: currentEntry.client_id,
          });

        if (insertError) {
          console.error('Erro ao inserir próximo lançamento:', insertError);
        } else {
          console.log('DEBUG - Próximo lançamento criado com sucesso');
        }
      }
    }

  } catch (error) {
    console.error('Erro ao gerar próximo lançamento:', error);
  }
};
