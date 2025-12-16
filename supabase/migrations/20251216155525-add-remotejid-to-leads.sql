-- Adicionar coluna remotejid na tabela leads
-- Esta coluna armazena o remote JID do WhatsApp para identificação única do contato
ALTER TABLE public.leads 
ADD COLUMN remotejid TEXT;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.leads.remotejid IS 'Remote JID do WhatsApp para identificação única do contato';

