-- Function to handle the purchase of a skin
CREATE OR REPLACE FUNCTION purchase_skin(
  p_inventory_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID,
  p_price DECIMAL,
  p_skin_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Begin transaction
  BEGIN
    -- Update buyer's balance
    UPDATE users
    SET balance = balance - p_price
    WHERE id = p_buyer_id;
    
    -- Update seller's balance
    UPDATE users
    SET balance = balance + p_price
    WHERE id = p_seller_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      seller_id,
      buyer_id,
      skin_id,
      price,
      status
    ) VALUES (
      p_seller_id,
      p_buyer_id,
      p_skin_id,
      p_price,
      'completed'
    );
    
    -- Update inventory record (transfer ownership)
    UPDATE inventory
    SET 
      user_id = p_buyer_id,
      is_for_sale = false,
      asking_price = NULL,
      updated_at = NOW()
    WHERE id = p_inventory_id;
    
    -- Commit transaction
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback transaction on error
      ROLLBACK;
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
