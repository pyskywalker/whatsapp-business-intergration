-- AlterTable
ALTER TABLE `facilities` ADD COLUMN `access_token` VARCHAR(191) NULL,
    ADD COLUMN `whatsapp_business_phone_number_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ReceivedMessages` MODIFY `message_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `SentMessages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `whatsappBusinessPhoneNumberId` VARCHAR(191) NOT NULL,
    `recipientPhoneNumber` VARCHAR(191) NOT NULL,
    `messageBody` VARCHAR(191) NOT NULL,
    `previewUrl` VARCHAR(191) NULL,
    `facilityCode` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `message_id` VARCHAR(191) NULL,
    `error_message` VARCHAR(191) NULL,
    `error_code` VARCHAR(191) NULL,
    `error_subcode` VARCHAR(191) NULL,
    `error_type` VARCHAR(191) NULL,
    `fbtrace_id` VARCHAR(191) NULL,
    `wa_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
