-- Add new stat columns to profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS focus_stat,
DROP COLUMN IF EXISTS energy_stat,
DROP COLUMN IF EXISTS empathy_stat,
DROP COLUMN IF EXISTS confidence_stat,
ADD COLUMN w_core_stat integer DEFAULT 50,
ADD COLUMN mirror_mind_stat integer DEFAULT 50,
ADD COLUMN real_feels_stat integer DEFAULT 50,
ADD COLUMN vybe_chek_stat integer DEFAULT 50,
ADD COLUMN moralus_stat integer DEFAULT 50,
ADD COLUMN comeback_season_stat integer DEFAULT 50,
ADD COLUMN clutch_up_stat integer DEFAULT 50,
ADD COLUMN head_space_stat integer DEFAULT 50,
ADD COLUMN scene_sense_stat integer DEFAULT 50;