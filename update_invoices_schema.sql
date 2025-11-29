-- Add items column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Grant access to authenticated users
GRANT ALL ON public.invoices TO authenticated;
