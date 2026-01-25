-- CreateTable
CREATE TABLE "inventory_start_stock" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "start_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_start_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_start_stock_inventory_id_record_date_key" ON "inventory_start_stock"("inventory_id", "record_date");

-- AddForeignKey
ALTER TABLE "inventory_start_stock" ADD CONSTRAINT "inventory_start_stock_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
