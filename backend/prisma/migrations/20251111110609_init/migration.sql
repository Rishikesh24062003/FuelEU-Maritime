-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "route_id" TEXT NOT NULL,
    "vessel_type" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ghg_intensity" DOUBLE PRECISION NOT NULL,
    "fuel_consumption" DOUBLE PRECISION NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "total_emissions" DOUBLE PRECISION NOT NULL,
    "is_baseline" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ship_compliance" (
    "id" TEXT NOT NULL,
    "ship_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cb_gco2eq" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ship_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_entries" (
    "id" TEXT NOT NULL,
    "ship_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount_gco2eq" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_members" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "ship_id" TEXT NOT NULL,
    "cb_before" DOUBLE PRECISION NOT NULL,
    "cb_after" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pool_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "routes_route_id_key" ON "routes"("route_id");
