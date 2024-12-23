-- CreateTable
CREATE TABLE "GameHistory" (
    "id" SERIAL NOT NULL,
    "winner" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stats" JSONB NOT NULL,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" SERIAL NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
