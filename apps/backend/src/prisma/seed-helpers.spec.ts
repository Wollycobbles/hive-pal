import { resetPollenReferenceSeedData } from '../../prisma/seed-helpers';

describe('resetPollenReferenceSeedData', () => {
  it('clears only the pollen reference tables', async () => {
    const pollenReferenceRegionDeleteMany = jest.fn().mockResolvedValue(undefined);
    const pollenReferenceDeleteMany = jest.fn().mockResolvedValue(undefined);
    const transaction = jest.fn().mockImplementation(async (operations: unknown[]) => {
      await Promise.all(operations as Array<Promise<unknown>>);
      return undefined;
    });

    await resetPollenReferenceSeedData({
      $transaction: transaction,
      pollenReferenceRegion: {
        deleteMany: pollenReferenceRegionDeleteMany,
      },
      pollenReference: {
        deleteMany: pollenReferenceDeleteMany,
      },
    });

    expect(pollenReferenceRegionDeleteMany).toHaveBeenCalledTimes(1);
    expect(pollenReferenceDeleteMany).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0][0]).toHaveLength(2);
  });
});
