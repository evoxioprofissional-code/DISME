-- DisMe — catálogo (dados de produto, não usuários fictícios)

insert into public.games (id, name, short) values
  ('cs2','Counter-Strike 2','CS2'),
  ('valorant','Valorant','VALO'),
  ('lol','League of Legends','LoL'),
  ('minecraft','Minecraft','MC'),
  ('fortnite','Fortnite','FN'),
  ('gta','GTA V','GTA'),
  ('genshin','Genshin Impact','GI'),
  ('overwatch','Overwatch 2','OW2'),
  ('apex','Apex Legends','APEX'),
  ('roblox','Roblox','RBLX'),
  ('amongus','Among Us','AU'),
  ('stardew','Stardew Valley','SV'),
  ('eldenring','Elden Ring','ER'),
  ('rocketleague','Rocket League','RL')
on conflict (id) do nothing;

insert into public.gifts (id, name, rarity, price, category, supply, minted, description, flex_value) values
  ('rosa','Rosa','common',40,'romanticos',null,0,'Um clássico que nunca sai de moda.',40),
  ('carta','Carta','common',60,'romanticos',null,0,'Palavras que ficam guardadas.',60),
  ('ursinho','Ursinho','common',90,'populares',null,0,'Para abraçar mesmo à distância.',90),
  ('cafe','Café da Madrugada','rare',150,'populares',null,0,'Para as calls que viram sol.',160),
  ('controle','Controle Dourado','rare',240,'colecionaveis',null,0,'Para o duo que carrega o ranqueado.',260),
  ('alianca','Aliança','epic',480,'romanticos',null,0,'Um pedido que vale um print.',520),
  ('coroa','Coroa','epic',620,'raros',null,0,'Reservada para quem lidera o Flex.',700),
  ('galaxia','Galáxia','legendary',1200,'raros',null,0,'Um universo inteiro numa caixa.',1400),
  ('coroa-cristal','Coroa de Cristal','legendary',2000,'colecionaveis',1000,0,'Cada peça é numerada e única.',2400),
  ('eclipse','Eclipse','limited',3500,'limitados',500,0,'Some quando as 500 unidades acabarem.',4200),
  ('misterioso','Presente Misterioso','rare',200,'populares',null,0,'Ninguém sabe o que tem dentro. Nem você.',220),
  ('trono','Trono','limited',5000,'limitados',100,0,'Só cem pessoas terão. Uma delas pode ser você.',6000)
on conflict (id) do nothing;
