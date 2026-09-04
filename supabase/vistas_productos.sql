-- Registro de vistas de productos y estadísticas por categoría.
-- Ejecutar en el SQL Editor de Supabase (Dashboard > SQL Editor).

create table if not exists vistas_productos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_vistas_productos_producto_id on vistas_productos(producto_id);

alter table vistas_productos enable row level security;

-- Cualquier visitante (logueado o no) puede registrar una vista.
create policy "Cualquiera puede registrar vistas"
  on vistas_productos for insert
  to anon, authenticated
  with check (true);

-- Solo usuarios autenticados (admin) pueden leer las vistas.
create policy "Solo autenticados pueden leer vistas"
  on vistas_productos for select
  to authenticated
  using (true);

-- Vista: total de vistas por producto.
create or replace view vistas_por_producto as
select producto_id, count(*)::int as total_vistas
from vistas_productos
group by producto_id;

-- Vista: total de vistas por categoría.
create or replace view vistas_por_categoria as
select
  p.categoria_id,
  c.nombre as categoria_nombre,
  count(v.id)::int as total_vistas
from vistas_productos v
join productos p on p.id = v.producto_id
left join categorias c on c.id = p.categoria_id
group by p.categoria_id, c.nombre;

-- Las vistas deben respetar el RLS de vistas_productos según el usuario que consulta
-- (no los permisos de quien las creó), y solo el admin (rol authenticated) puede leerlas.
alter view vistas_por_producto set (security_invoker = true);
alter view vistas_por_categoria set (security_invoker = true);

revoke all on vistas_por_producto from anon, public;
revoke all on vistas_por_categoria from anon, public;
grant select on vistas_por_producto to authenticated;
grant select on vistas_por_categoria to authenticated;
