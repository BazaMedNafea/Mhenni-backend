-- CreateTable
CREATE TABLE "provider" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "is_individual" BOOLEAN NOT NULL,
    "is_registered_office" BOOLEAN NOT NULL,
    "office_address" TEXT,
    "zip" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_rating" (
    "provider_id" INTEGER NOT NULL,
    "avg_punc_rating" DOUBLE PRECISION NOT NULL,
    "avg_prof_rating" DOUBLE PRECISION NOT NULL,
    "avg_eti_rating" DOUBLE PRECISION NOT NULL,
    "avg_comm_rating" DOUBLE PRECISION NOT NULL,
    "avg_price_rating" DOUBLE PRECISION NOT NULL,
    "avg_overall_rating" DOUBLE PRECISION NOT NULL,
    "last_updated_on" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_rating_pkey" PRIMARY KEY ("provider_id")
);

-- CreateTable
CREATE TABLE "provider_review_log" (
    "id" SERIAL NOT NULL,
    "service_appointment_id" INTEGER NOT NULL,
    "punctuality_rating" INTEGER NOT NULL,
    "proficiency_rating" INTEGER NOT NULL,
    "etiquettes_rating" INTEGER NOT NULL,
    "communication_rating" INTEGER NOT NULL,
    "price_rating" INTEGER NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "review" TEXT,
    "review_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_review_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_category" (
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "service_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" SERIAL NOT NULL,
    "service_name" TEXT NOT NULL,
    "service_category_id" INTEGER NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_map" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "billing_rate_per_hour" DOUBLE PRECISION NOT NULL,
    "experience_in_months" INTEGER NOT NULL,
    "service_offering_desc" TEXT,

    CONSTRAINT "service_provider_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "second_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_delivery_offer" (
    "id" SERIAL NOT NULL,
    "service_request_id" INTEGER NOT NULL,
    "service_provider_map_id" INTEGER NOT NULL,
    "discount_in_percentage" DOUBLE PRECISION,
    "is_offer_accepted" BOOLEAN,

    CONSTRAINT "service_delivery_offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "requirement_desc" TEXT,
    "expected_start_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_appointment" (
    "id" SERIAL NOT NULL,
    "service_delivery_offer_id" INTEGER NOT NULL,
    "service_deliver_on" TIMESTAMP(3) NOT NULL,
    "service_start_time" TIMESTAMP(3) NOT NULL,
    "service_end_time" TIMESTAMP(3),

    CONSTRAINT "service_appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_review_log_service_appointment_id_key" ON "provider_review_log"("service_appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_delivery_offer_service_provider_map_id_key" ON "service_delivery_offer"("service_provider_map_id");

-- AddForeignKey
ALTER TABLE "provider_rating" ADD CONSTRAINT "provider_rating_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_review_log" ADD CONSTRAINT "provider_review_log_service_appointment_id_fkey" FOREIGN KEY ("service_appointment_id") REFERENCES "service_appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_service_category_id_fkey" FOREIGN KEY ("service_category_id") REFERENCES "service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_map" ADD CONSTRAINT "service_provider_map_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_map" ADD CONSTRAINT "service_provider_map_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_delivery_offer" ADD CONSTRAINT "service_delivery_offer_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_delivery_offer" ADD CONSTRAINT "service_delivery_offer_service_provider_map_id_fkey" FOREIGN KEY ("service_provider_map_id") REFERENCES "service_provider_map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_appointment" ADD CONSTRAINT "service_appointment_service_delivery_offer_id_fkey" FOREIGN KEY ("service_delivery_offer_id") REFERENCES "service_delivery_offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
