-- Enable deletion for invoices
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
CREATE POLICY "Users can delete their own invoices" ON public.invoices
    FOR DELETE USING (auth.uid() = seller_id);

-- Enable deletion for products
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- Enable deletion for services
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
CREATE POLICY "Users can delete their own services" ON public.services
    FOR DELETE USING (auth.uid() = seller_id);

-- Enable deletion for portfolio items (posts)
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON public.portfolio_items;
CREATE POLICY "Users can delete their own portfolio items" ON public.portfolio_items
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
