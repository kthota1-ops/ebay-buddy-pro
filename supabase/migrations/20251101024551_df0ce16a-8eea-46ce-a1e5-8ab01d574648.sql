-- Create table for multiple eBay account connections
CREATE TABLE public.ebay_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  ebay_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebay_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own eBay accounts"
ON public.ebay_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own eBay accounts"
ON public.ebay_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eBay accounts"
ON public.ebay_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own eBay accounts"
ON public.ebay_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ebay_accounts_updated_at
BEFORE UPDATE ON public.ebay_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add ebay_account_id to inventory table to link items to specific accounts
ALTER TABLE public.inventory
ADD COLUMN ebay_account_id UUID REFERENCES public.ebay_accounts(id) ON DELETE SET NULL;