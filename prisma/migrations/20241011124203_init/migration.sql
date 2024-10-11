-- CreateTable
CREATE TABLE `ReceivedMessages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_id` VARCHAR(191) NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `messaging_product` VARCHAR(191) NOT NULL,
    `display_phone_number` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `wa_id` VARCHAR(191) NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `timestamp` VARCHAR(191) NOT NULL,
    `facility_code` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
