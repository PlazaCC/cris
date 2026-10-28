CREATE TABLE "about" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"clients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" jsonb DEFAULT '{"desktop":"","mobile":""}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "about_singleton" CHECK ("about"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_name_unique" UNIQUE("name"),
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "footer" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"copyright" text DEFAULT '' NOT NULL,
	"colophon" text,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "footer_singleton" CHECK ("footer"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "hero" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"highlight" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image" jsonb DEFAULT '{"desktop":"","mobile":""}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hero_singleton" CHECK ("hero"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "project_badges" (
	"project_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_badges_project_id_badge_id_pk" PRIMARY KEY("project_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"blur_color" text DEFAULT '' NOT NULL,
	"cover_image" jsonb DEFAULT '{"desktop":"","mobile":""}'::jsonb NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_global" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"site_name" text DEFAULT '' NOT NULL,
	"site_description" text DEFAULT '' NOT NULL,
	"favicon" text DEFAULT '' NOT NULL,
	"default_seo" jsonb DEFAULT '{"metaTitle":"","metaDescription":"","shareImage":""}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_global_singleton" CHECK ("site_global"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "project_badges" ADD CONSTRAINT "project_badges_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_badges" ADD CONSTRAINT "project_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;