-- Add expense breakdown JSON to daily sales
ALTER TABLE "daily_sales" ADD COLUMN "expense_breakdown" JSONB;
