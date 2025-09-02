-- Create trigger to automatically update vybecoin balance when coin transactions are inserted
CREATE OR REPLACE TRIGGER update_vybecoin_balance_trigger
AFTER INSERT ON coin_transactions
FOR EACH ROW
EXECUTE FUNCTION update_vybecoin_balance();