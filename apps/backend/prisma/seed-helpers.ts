type PollenReferenceSeedPrisma = {
  $transaction: <T>(operations: T[]) => Promise<unknown>;
  pollenReferenceRegion: {
    deleteMany: () => Promise<unknown>;
  };
  pollenReference: {
    deleteMany: () => Promise<unknown>;
  };
};

export async function resetPollenReferenceSeedData(
  prisma: PollenReferenceSeedPrisma,
): Promise<void> {
  await prisma.$transaction([
    prisma.pollenReferenceRegion.deleteMany(),
    prisma.pollenReference.deleteMany(),
  ]);
}
