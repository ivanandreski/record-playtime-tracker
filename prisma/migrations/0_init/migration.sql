-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "album" (
    "id" BIGSERIAL NOT NULL,
    "discogs_id" VARCHAR(255),
    "name" VARCHAR(255),
    "image_url" VARCHAR(255),
    "release_year" INTEGER NOT NULL,
    "artist" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_album" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album_release" (
    "id" BIGSERIAL NOT NULL,
    "discogs_id" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL,
    "added_on" TIMESTAMPTZ(6) NOT NULL,
    "album_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_album_release" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "position" VARCHAR(255),
    "duration" INTEGER NOT NULL,
    "album_release_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_track" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stylus" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50),
    "description" VARCHAR(255),
    "playtime" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_stylus" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_session" (
    "id" BIGSERIAL NOT NULL,
    "playtime" INTEGER NOT NULL,
    "stylus_id" BIGINT NOT NULL,
    "album_release_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_play_session" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_session_track" (
    "id" BIGSERIAL NOT NULL,
    "play_session_id" BIGINT NOT NULL,
    "track_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_play_session_track" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ix_album_discogs_id" ON "album"("discogs_id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_album_release_discogs_id" ON "album_release"("discogs_id");

-- CreateIndex
CREATE INDEX "ix_album_release_album_id" ON "album_release"("album_id");

-- CreateIndex
CREATE INDEX "ix_track_album_release_id" ON "track"("album_release_id");

-- CreateIndex
CREATE INDEX "ix_play_session_album_release_id" ON "play_session"("album_release_id");

-- CreateIndex
CREATE INDEX "ix_play_session_stylus_id" ON "play_session"("stylus_id");

-- CreateIndex
CREATE INDEX "ix_play_session_track_play_session_id" ON "play_session_track"("play_session_id");

-- CreateIndex
CREATE INDEX "ix_play_session_track_track_id" ON "play_session_track"("track_id");

-- AddForeignKey
ALTER TABLE "album_release" ADD CONSTRAINT "fk_album_release_album_album_id" FOREIGN KEY ("album_id") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "fk_track_album_release_album_release_id" FOREIGN KEY ("album_release_id") REFERENCES "album_release"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "play_session" ADD CONSTRAINT "fk_play_session_album_release_album_release_id" FOREIGN KEY ("album_release_id") REFERENCES "album_release"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "play_session" ADD CONSTRAINT "fk_play_session_stylus_stylus_id" FOREIGN KEY ("stylus_id") REFERENCES "stylus"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "play_session_track" ADD CONSTRAINT "fk_play_session_track_play_session_play_session_id" FOREIGN KEY ("play_session_id") REFERENCES "play_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "play_session_track" ADD CONSTRAINT "fk_play_session_track_track_track_id" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

