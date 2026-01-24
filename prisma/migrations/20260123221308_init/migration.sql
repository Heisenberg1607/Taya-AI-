-- CreateTable
CREATE TABLE "memory_cards" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transcript" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT[],
    "actionItems" TEXT[],
    "mood" TEXT NOT NULL,
    "rawLlmJson" JSONB NOT NULL,

    CONSTRAINT "memory_cards_pkey" PRIMARY KEY ("id")
);
