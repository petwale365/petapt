create table public.addresses (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  type public.address_type not null default 'shipping'::address_type,
  first_name text not null,
  last_name text not null,
  address_line1 text not null,
  address_line2 text null,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India'::text,
  phone text not null,
  secondary_phone text null,
  is_default boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint addresses_pkey primary key (id),
  constraint addresses_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;


create table public.categories (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  description text null,
  image_url text null,
  is_active boolean null default true,
  sort_order integer null default 0,
  seo_title text null,
  seo_description text null,
  seo_keywords text[] null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  metadata jsonb null,
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug)
) TABLESPACE pg_default;


create table public.collections (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  description text null,
  image_url text null,
  is_active boolean null default true,
  is_featured boolean null default false,
  sort_order integer null default 0,
  seo_title text null,
  seo_description text null,
  seo_keywords text[] null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  metadata jsonb null,
  constraint collections_pkey primary key (id),
  constraint collections_slug_key unique (slug)
) TABLESPACE pg_default;


create table public.inventory_transactions (
  id uuid not null default extensions.uuid_generate_v4 (),
  variant_id uuid null,
  type text not null,
  quantity integer not null,
  previous_quantity integer not null,
  reference_type text null,
  reference_id uuid null,
  notes text null,
  created_by uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint inventory_transactions_pkey primary key (id),
  constraint inventory_transactions_created_by_fkey foreign KEY (created_by) references users (id),
  constraint inventory_transactions_variant_id_fkey foreign KEY (variant_id) references product_variants (id)
) TABLESPACE pg_default;


create table public.option_values (
  id uuid not null default extensions.uuid_generate_v4 (),
  option_id uuid null,
  value text not null,
  display_value text not null,
  metadata jsonb null,
  sort_order integer null default 0,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint option_values_pkey primary key (id),
  constraint option_values_option_id_fkey foreign KEY (option_id) references product_options (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.order_items (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_id uuid not null,
  product_id uuid not null,
  variant_id uuid null,
  quantity integer not null,
  unit_price numeric not null,
  total_price numeric not null,
  created_at timestamp with time zone null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id),
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id),
  constraint order_items_variant_id_fkey foreign KEY (variant_id) references product_variants (id)
) TABLESPACE pg_default;


create table public.orders (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_number text not null,
  user_id uuid not null,
  status public.order_status not null default 'new'::order_status,
  total_amount numeric not null,
  shipping_fee numeric null,
  subtotal numeric not null,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending'::payment_status,
  razorpay_order_id text null,
  razorpay_payment_id text null,
  shipping_address_id uuid not null,
  billing_address_id uuid not null,
  shiprocket_order_id integer null,
  shipment_id integer null,
  tracking_number text null,
  courier_name text null,
  length double precision null,
  breadth double precision null,
  height double precision null,
  weight double precision null,
  pickup_location text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_billing_address_id_fkey foreign KEY (billing_address_id) references addresses (id),
  constraint orders_shipping_address_id_fkey foreign KEY (shipping_address_id) references addresses (id),
  constraint orders_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;


create table public.product_attributes (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  unit text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  product_id uuid not null,
  value text not null,
  constraint product_attributes_pkey primary key (id),
  constraint product_attributes_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.product_categories (
  id uuid not null default extensions.uuid_generate_v4 (),
  product_id uuid null,
  category_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint product_categories_pkey primary key (id),
  constraint product_categories_product_id_category_id_key unique (product_id, category_id),
  constraint product_categories_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE,
  constraint product_categories_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.product_collections (
  id uuid not null default extensions.uuid_generate_v4 (),
  product_id uuid null,
  collection_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint product_collections_pkey primary key (id),
  constraint product_collections_product_id_collection_id_key unique (product_id, collection_id),
  constraint product_collections_collection_id_fkey foreign KEY (collection_id) references collections (id) on delete CASCADE,
  constraint product_collections_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.product_images (
  id uuid not null default extensions.uuid_generate_v4 (),
  product_id uuid null,
  variant_id uuid null,
  url text not null,
  alt_text text null,
  sort_order integer null default 0,
  is_thumbnail boolean null default false,
  width integer null,
  height integer null,
  mime_type text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint product_images_pkey primary key (id),
  constraint product_images_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint product_images_variant_id_fkey foreign KEY (variant_id) references product_variants (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.product_options (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  display_name text not null,
  type text not null,
  required boolean null default true,
  sort_order integer null default 0,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint product_options_pkey primary key (id)
) TABLESPACE pg_default;

create table public.product_options_assignments (
  id uuid not null default extensions.uuid_generate_v4 (),
  product_id uuid null,
  option_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint product_options_assignments_pkey primary key (id),
  constraint product_options_assignments_product_id_option_id_key unique (product_id, option_id),
  constraint product_options_assignments_option_id_fkey foreign KEY (option_id) references product_options (id) on delete CASCADE,
  constraint product_options_assignments_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.product_variants (
  id uuid not null default extensions.uuid_generate_v4 (),
  product_id uuid null,
  sku text null,
  barcode text null,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2) null,
  stock_quantity integer not null default 0,
  low_stock_alert integer null default 5,
  weight numeric(10, 2) null,
  is_default boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint product_variants_pkey primary key (id),
  constraint product_variants_barcode_key unique (barcode),
  constraint product_variants_sku_key unique (sku),
  constraint product_variants_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint product_variants_price_check check ((price >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_variant_product_stock on public.product_variants using btree (product_id, stock_quantity, is_active) TABLESPACE pg_default;

create index IF not exists idx_variants_active_stock on public.product_variants using btree (is_active, stock_quantity) TABLESPACE pg_default;

create index IF not exists idx_variants_product on public.product_variants using btree (product_id) TABLESPACE pg_default;

create index IF not exists idx_variants_sku on public.product_variants using btree (sku) TABLESPACE pg_default;



create table public.products (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  description text null,
  category_id uuid null,
  base_price numeric(10, 2) not null,
  sale_price numeric(10, 2) null,
  is_active boolean null default true,
  is_featured boolean null default false,
  seo_title text null,
  seo_description text null,
  seo_keywords text[] null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  metadata jsonb null,
  constraint products_pkey primary key (id),
  constraint products_slug_key unique (slug),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id),
  constraint products_base_price_check check ((base_price >= (0)::numeric)),
  constraint products_sale_price_check check ((sale_price >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_product_category_active on public.products using btree (category_id, is_active) TABLESPACE pg_default;

create index IF not exists idx_products_active on public.products using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_products_category on public.products using btree (category_id) TABLESPACE pg_default;

create index IF not exists idx_products_search on public.products using gin (
  to_tsvector(
    'english'::regconfig,
    (
      (name || ' '::text) || COALESCE(description, ''::text)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_products_slug on public.products using btree (slug) TABLESPACE pg_default;

create table public.related_products (
  id uuid not null default extensions.uuid_generate_v4 (),
  product_id uuid null,
  related_product_id uuid null,
  type text not null,
  sort_order integer null default 0,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint related_products_pkey primary key (id),
  constraint related_products_product_id_related_product_id_key unique (product_id, related_product_id),
  constraint related_products_product_id_fkey foreign KEY (product_id) references products (id),
  constraint related_products_related_product_id_fkey foreign KEY (related_product_id) references products (id)
) TABLESPACE pg_default;


create table public.shiprocket_auth (
  id uuid not null default extensions.uuid_generate_v4 (),
  token text not null,
  email text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint shiprocket_auth_pkey primary key (id)
) TABLESPACE pg_default;

create table public.users (
  id uuid not null,
  email text not null,
  phone text null,
  full_name text null,
  avatar_url text null,
  role text not null default 'customer'::text,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  last_login_at timestamp with time zone null,
  metadata jsonb null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.variant_option_values (
  id uuid not null default extensions.uuid_generate_v4 (),
  variant_id uuid null,
  option_id uuid null,
  option_value_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint variant_option_values_variant_id_option_id_key unique (variant_id, option_id),
  constraint variant_option_values_option_id_fkey foreign KEY (option_id) references product_options (id) on delete CASCADE,
  constraint variant_option_values_option_value_id_fkey foreign KEY (option_value_id) references option_values (id) on delete CASCADE,
  constraint variant_option_values_variant_id_fkey foreign KEY (variant_id) references product_variants (id)
) TABLESPACE pg_default;


create table public.cart_items (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  session_id text not null,
  product_id uuid not null,
  variant_id uuid null,
  quantity integer not null default 1,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint cart_items_pkey primary key (id),
  constraint cart_items_session_id_product_id_variant_id_key unique (session_id, product_id, variant_id),
  constraint cart_items_user_id_product_id_variant_id_key unique (user_id, product_id, variant_id),
  constraint cart_items_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint cart_items_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint cart_items_variant_id_fkey foreign KEY (variant_id) references product_variants (id) on delete CASCADE,
  constraint cart_items_quantity_check check ((quantity > 0))
) TABLESPACE pg_default;

create index IF not exists idx_cart_items_user_id on public.cart_items using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_cart_items_session_id on public.cart_items using btree (session_id) TABLESPACE pg_default;