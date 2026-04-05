-- CreateTable
CREATE TABLE "Promo" (
    "id" SERIAL NOT NULL,
    "promocode" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promo_promocode_key" ON "Promo"("promocode");
