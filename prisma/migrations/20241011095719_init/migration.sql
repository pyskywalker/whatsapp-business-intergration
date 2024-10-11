-- CreateTable
CREATE TABLE `Facilities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facility_code` VARCHAR(191) NOT NULL,
    `verify_token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Facilities_facility_code_key`(`facility_code`),
    UNIQUE INDEX `Facilities_verify_token_key`(`verify_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
