CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canvas_id" uuid NOT NULL,
	"block_no" integer NOT NULL,
	"content" text,
	"status" text DEFAULT 'empty' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blocks_canvas_block_unique" UNIQUE("canvas_id","block_no")
);
--> statement-breakpoint
ALTER TABLE "blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "canvases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"one_liner" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "canvases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canvas_id" uuid NOT NULL,
	"block_no" integer NOT NULL,
	"stage" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_canvas_id_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_canvas_id_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "blocks_owner_all" ON "blocks" AS PERMISSIVE FOR ALL TO "authenticated" USING ("blocks"."canvas_id" in (select id from "canvases" where "canvases"."user_id" = (select auth.uid()))) WITH CHECK ("blocks"."canvas_id" in (select id from "canvases" where "canvases"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "canvases_owner_all" ON "canvases" AS PERMISSIVE FOR ALL TO "authenticated" USING ("canvases"."user_id" = (select auth.uid())) WITH CHECK ("canvases"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "messages_owner_all" ON "messages" AS PERMISSIVE FOR ALL TO "authenticated" USING ("messages"."canvas_id" in (select id from "canvases" where "canvases"."user_id" = (select auth.uid()))) WITH CHECK ("messages"."canvas_id" in (select id from "canvases" where "canvases"."user_id" = (select auth.uid())));