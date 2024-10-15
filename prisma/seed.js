const prisma = require("../src/PrismaClient");

async function main() {
  const facilities = [
    {
      facility_code: "GPITG",
      verify_token: "GPITG-2009-KW-DSM",
      whatsapp_business_phone_number_id: "459515070570744",
      access_token:
        "EAAZAxCj9RKrEBO3wusQ8dOlWsKO5Qa81sPqRgZBXcDZBw9CRY2sBiZC3jTCQMGiYHZAXZBI9ZAIlD7CpZCGMxySEJ2tSBPWB9DzBIKW5wWNCkfV7qQ2ZBtp7RxKe9XrR0ragvMbzROsYIlUtG3ADsmkzMKNfAAQQfZAhvGqLiRGNbNzvnBxnZAKdiaq5tsTIZCnGV6nGupzOgYf9KnoRg7hZB",
    },
  ];

  for (const facility of facilities) {
    await prisma.facilities.create({
      data: facility,
    });
    console.log(facility?.facility_code + "  Added Successfully");
  }

  console.log("Facilities seeded successfully!");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    prisma.$disconnect();
  });
