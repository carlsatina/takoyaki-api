-- CreateTable
CREATE TABLE "daily_sales" (
    "id" SERIAL NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cash_on_hand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_gcash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_sales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "senior_discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pos_cash_on_hand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actual_cash_on_hand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cash_goal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cash_needed_for_goal" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "daily_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_sales_staff_cash" (
    "id" SERIAL NOT NULL,
    "daily_sales_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "cash_on_hand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gcash" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "daily_sales_staff_cash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "daily_sales_goal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthly_sales_goal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "daily_sales_staff_cash" ADD CONSTRAINT "daily_sales_staff_cash_daily_sales_id_fkey" FOREIGN KEY ("daily_sales_id") REFERENCES "daily_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_staff_cash" ADD CONSTRAINT "daily_sales_staff_cash_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "user_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
