CREATE TABLE "countries" (
	"code" varchar(2) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"continent" text NOT NULL,
	"capital" text DEFAULT '' NOT NULL,
	"passport" varchar(2) DEFAULT 'IN' NOT NULL,
	"category" text NOT NULL,
	"stay_days" integer NOT NULL,
	"fee_usd" integer DEFAULT 0 NOT NULL,
	"fee_inr" integer DEFAULT 0 NOT NULL,
	"processing_min_days" integer DEFAULT 0 NOT NULL,
	"processing_max_days" integer DEFAULT 0 NOT NULL,
	"is_schengen" boolean DEFAULT false NOT NULL,
	"waivers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"documents" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"official_url" text DEFAULT '' NOT NULL,
	"source_url" text,
	"airports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommended_hubs" jsonb,
	"tagline" text DEFAULT '' NOT NULL,
	"best_time" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"sample_low_fare_inr" integer,
	"fare_trends" jsonb,
	"last_verified_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curated_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"origin_iata" varchar(8) NOT NULL,
	"hub_iata" varchar(3) NOT NULL,
	"destination_country" varchar(2) NOT NULL,
	"destination_iata" varchar(3) NOT NULL,
	"route" jsonb NOT NULL,
	"verified_date" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transit_hubs" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"airport_name" text NOT NULL,
	"city" text NOT NULL,
	"airside_transit_allowed" boolean DEFAULT true NOT NULL,
	"airside_self_transfer" boolean DEFAULT false NOT NULL,
	"max_airside_hours" integer DEFAULT 24 NOT NULL,
	"transit_visa_required" boolean DEFAULT false NOT NULL,
	"transit_visa_exempt_with" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transit_visa_cost_inr" integer DEFAULT 0 NOT NULL,
	"transit_visa_cost_usd" integer DEFAULT 0 NOT NULL,
	"terminal_change_requires_visa" boolean DEFAULT false NOT NULL,
	"profile" jsonb NOT NULL,
	"last_verified_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "countries_category_idx" ON "countries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "countries_verified_idx" ON "countries" USING btree ("last_verified_at");--> statement-breakpoint
CREATE INDEX "curated_routes_dest_idx" ON "curated_routes" USING btree ("destination_country");