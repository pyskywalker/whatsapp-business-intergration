/*
  Warnings:

  - You are about to drop the column `access_token` on the `facilities` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp_business_phone_number_id` on the `facilities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `facilities` DROP COLUMN `access_token`,
    DROP COLUMN `whatsapp_business_phone_number_id`;
