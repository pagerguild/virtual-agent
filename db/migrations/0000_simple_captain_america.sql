CREATE TYPE "public"."booking_type" AS ENUM('flight', 'hotel');--> statement-breakpoint
CREATE TYPE "public"."rider_status" AS ENUM('draft', 'sent', 'signed');--> statement-breakpoint
CREATE TYPE "public"."rider_doc_status" AS ENUM('draft', 'sent', 'signed');--> statement-breakpoint
CREATE TYPE "public"."tour_status" AS ENUM('planning', 'confirmed', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"preferences" jsonb,
	"rider_template" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gig_id" uuid NOT NULL,
	"type" "booking_type" NOT NULL,
	"provider" text,
	"confirmation_number" text,
	"cost" numeric(10, 2),
	"check_in" timestamp with time zone,
	"check_out" timestamp with time zone,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"venue_name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"date" date NOT NULL,
	"promoter_name" text,
	"promoter_email" text,
	"fee" numeric(10, 2),
	"rider_status" "rider_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gig_id" uuid NOT NULL,
	"content" jsonb,
	"pdf_url" text,
	"status" "rider_doc_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"budget" numeric(10, 2),
	"status" "tour_status" DEFAULT 'planning' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "riders_gig_id_unique" ON "riders" USING btree ("gig_id");