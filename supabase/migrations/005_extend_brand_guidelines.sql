-- Extend brand_guidelines to support full brand signal collection
alter table brand_guidelines
  add column if not exists imagery_style      text,
  add column if not exists lighting           text,
  add column if not exists composition        text,
  add column if not exists photography_style  text,
  add column if not exists brand_is_not       text,
  add column if not exists audience           text,
  add column if not exists color_mood         text,
  add column if not exists brand_keywords     text[];
