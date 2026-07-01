-- Drop existing policy
DROP POLICY IF EXISTS "Users can create spots" ON public.spots;

-- Create new policy with explicit roles
CREATE POLICY "Users can create spots" ON public.spots
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id);
