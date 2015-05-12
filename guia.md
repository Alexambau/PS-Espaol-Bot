Bot para las salas Español y Eventos de PS
====================

En esta guía se explican los comandos y funcionalidades de este Bot.


Comandos
------------

Comandos Básicos: 

 - `about` - Explica lo más general del Bot. Es un comando identificativo.
 - `hora` - Muestra la hora del Bot.
 - `help` - Devuelve el link a esta guía.
 - `eventos` - Devuelve el link de la sala 'Eventos'
 - `joke` - Devuelve un chiste en ingles.
 - `choose` - Elige entre varias opciones.
 - `seen` - Da información sobre la ultima vez que se vió a un usuario.
 - `helix` - Devuelve una respuesta aleatoria.
 - `b [texto]` - Devuelve el texto con link.
 - `gg` - Dice "No entiendo gg".
 - `poke` - Pone el data de un pokemon aleatorio.
 - `randompoke` - Devuelve el nombre de un Pokemon aleatorio.
 - `hashpoke [nick]` - Analiza un nick y devuelve un poke según el valor de los caracteres que lo forman.
 - `info [tópico]` - Comando dinámico modificable con ic.
 - `infowall [tópico]` - Da la información que daría info pero con announce, útil para moderadores y organizadores de eventos.

Comandos Informativos: 

 - `indice` - Mensaje de bienvenida
 - `guia` - Link al índice de guías de la sala Español
 - `foro` - Link al foro de la sala
 - `faq` - Preguntas frecuentes del chat
 - `plug` - Link al plug.dj oficial de la sala
 - `suspect [tier]` - Informacion sobre los suspect test
 - `voiced` - Explica como se puede llegar a ser ascendido a voiced
 - `vod` - Explica el concepto VoD (Voiced of Day)
 - `modchat` - Explica como funciona el modchat autoconfirmed
 - `sanciones` - Explica las sanciones existentes
 - `reglas` - Link a las reglas de la sala (con wall si se usa en la sala)
 - `staff` - Lista de staff de la sala

**Nota:** para ver los comandos informativos dinamicos hacer uso de `info list`
  
Comandos de Información sobre Pokemon: 

 - `gen [pokemon/item...]` - Indica a que generación pertenece el pokemon/item/...
 - `trad [item/move...]` - Traduce de español a inglés y de inglés a español el item/move...
 - `heavyslam [pokemon]` - Poder Base de Heavy Slam usado por un pokemon
 - `preevo [pokemon]` - Pre-Evolución de un pokemon
 - `priority [pokemon]` - Lista de movimientos de prioridad de un pokemon
 - `boosting [pokemon]` - Lista de movimientos de boosting de un pokemon
 - `recovery [pokemon]` - Lista de movimientos de recuperación de un pokemon
 - `hazards [pokemon]` - Lista de movimientos de hazards de un pokemon
 - `typelearn [pokemon], [tipo]` - Lista de movimientos un determinado tipo que puede apender un pokemon
  
Comandos de Moderacion:

 - `set` - Comando para cambiar permisos y moderación.
 - `ab` - Añade usuarios a la lista negra.
 - `unab` - Quita usuarios de la lista negra.
 - `vab` - Muestra la lista negra.
 - `zt` - Añade usuarios a cero tolerancia.
 - `unzt` - Quita usuarios de la lista de cero tolerancia.
 - `vzt` - Muestra la lista de cero tolerancia.
 - `banword` - Añade una frase a las banwords.
 - `unbanword` - Quita una frase de las banwords.
 - `vbw:` - Muestra la lista de frases prohibidas.
 - `iw` - Añade una palabra a la lista de lenguaje inapropiado.
 - `uiw` - Quita una palabra de la lista de lenguaje inapropiado.
 - `viw` - Muestra la lista de lenguaje inapropiado.
 - `tourhelp` - Muestra como debe usarse el comando tour.
 - `tour` - Crea un torneo y lo incia automaticamente.
  
Comandos de Programación:

 - `updateserver` - Actualiza el bot de manera remota. Devuelve un log de estado.
 - `kill` - Apaga el bot. Se usa para reiniciar.
 - `reload` - Actualiza los comandos.
 - `reloadbattle` - Actualiza los modulos de batalla automática.
 - `reloadteams` - Actualiza los equipos del Bot.
 - `reloaddata` - Actualiza los datos sobre pokemon, movimientos, etc.
 - `js` - Introduce un script de manera temporal en el bot.
 - `ip` - Calcula la ip del bot.
 - `ipdisable [ip]` - En caso de bots duplicados, deshabilita el bot con la ip especificada.
 - `ipenable [ip]` - En caso de bots duplicados, habilita el bot con la ip especificada.
 - `ipenableall` - Habilita todos los bots, en caso de duplicados

Comandos Administrativos Especiales:

 - `custom` - Controla lo que dice el Bot.
 - `say` - El bot dice algo personalizado, pero no se admiten comandos.
 - `allowbattle [on/off]` - Activa o desactiva las batallas automáticas.
 - `allowbattleall [on/off]` - Si se activa, el bot acepta todos los retos.
 - `move` - Fuerza al bot a tomar una decision en una batalla si este no la toma.
 - `jointours [on/off]` - Activa o desactiva la participación del bot en torneos.
 - `jointour` - Fuerza al bot a unirse a un torneo.
 - `sb [formato]` - Busca una batalla en ladder y devuelve el link a esta.
 - `chall [usuario], [formato]` - Se utiliza para que el bot rete a un usuario.
 - `getauth [sala]` - Guarda el roomauth de una sala como si fuese rango global.
 - `jf [set/delete], [usuario], [frase]` - Establece una frase que el bot dice cuando cierto usuario entra a una sala.
 - `vjf` - Muestra las frases de entrada adjudicadas en una sala.

Comando **ic** para modificar comandos dinámicos:

 - `ic [texto]` - Guarda un texto para asignárselo a un comando.
 - `ic -v` - Muestra el texto que hay guardado.
 - `ic -s [comando] [subcomando]` - Crea o modifica un subcomando dinámico (por ejemplo info [subcomando] o suspect [subcomando]).
 - `ic -d [comando] [subcomando]` - Borra un subcomando dinámico.
 
Programación de torneos:

 - `tours [on/off]` - Habilita o deshabilita los torneos programados. Por defecto están habilitados.
 - `progtour [hora], [minuto], [tier], [segundos para auto iniciarse], [minutos autodq], [laborales/findes]` - Programa un torneo para iniciarse todos los días a una determinada hora.
 - `unprogtour [hora], [minuto], [laborales/findes]` - Elimina un torneo programado.
 - `vpt` - Muestra la lista de torneos programados en una sala.

Torneo LeaderBoards:

 - `etour [tier], [nombre], [minutos-incrpciones], [minutos-autodq]` - Crea un torneo en la sala de Eventos (también lo hace automáticamente, pero esto es más manual), lo anuncia en Español. Tras un tiempo o inicia y pone el autodq. Tras finalizar el torneo recuenta puntos y actualiza el ranking.
 - `etourstdin` - Entrada standard para los datos referentes a las puntuaciones.
 - `etourstdinplus` - Entrada standard con suma para los datos referentes a las puntuaciones.
 - `etourstdout` - Salida standard para los datos referentes a las puntuaciones.
 - `reloadtour` - Vuelve a leer el archivo del calendario.
 - `updatetourladder` - Crea una tabla con las 50 mejores puntuaciones y la sube a hastebin.
 - `cleartourladder` - Lo mismo que updatetourladder pero a parte borra los datos (usar con precaución).
 - `ladder` - Muestra el link a la última actualización de la tabla de resultados.
 - `rank [user]` - Muestra la puntuacion de un usuario.
 - `infotour` - Muestra la información del torneo por puntos del día.
 - `calendar` - Link a un tema del foro con el calendario explicado.


Comandos Dinámicos
------------

Los comandos dinámicos, a diferencia de los comandos estáticos, pueden ser creados, modificados y eliminados sin tener que modificar el codigo fuente, mediante la inclusión dentro de otros comandos. El comando que permite trabajar con comandos dinámicos es ic:
 
 - `ic [texto]` - Guarda un texto para asignárselo a un comando.
 - `ic -v` - Muestra el texto que hay guardado.
 - `ic -s [comando] [subcomando]` - Crea o modifica un subcomando dinámico (por ejemplo info [subcomando] o suspect [subcomando]).
 - `ic -d [comando] [subcomando]` - Borra un subcomando dinámico.

Para ejecutar un comando dinámico debe usarse **,comando subcomando**
Los comandos dinámicos existentes son **suspect** e **info / infowall**. En el caso de **info**, los comandos pueden ser usados directamente como **,subcomando** si no existe ningún comando estático con dicho nombre.


Moderación Automática
------------

El bot detecta infracciones comunes y aplica una sanción automáticamente. Esta sanción va aumentando con la reincidencia. Actualmente estas son las infracciones que sanciona el bot (entre paréntesis la sanción mínima):

- **BannedWords:** sanciona los mensajes que contengan alguna frase de la lista negra. (Mute)
- **Inapropiate:** sanciona los mensajes que contengan palabras de una lista, pero estas deben encontrarse separadas, sin que formen parte de otras palabras. (Mute)
- **Spoiler:** sanciona el uso del spoiler. (Mute)
- **Flooding:** sanciona el flood, es decir, mensajes cortos muy rapidos. (Mute)
- **Caps:** sanciona en caso de un uso excesivo de las mayúsculas. (Warn)
- **Stretching:** sanciona en caso de que se alarguen las palabras exesivamente. (Warn)
- **Spam:** Detecta si se está produciendo spam, entendiendose por spam repetir uno o varios mensajes muchas veces, probablemente con intenciones publicitarias. (RoomBan)
- **Youtube:** sanciona la publicidad de canales de Youtube. (Mute)
- **PS Servers:** sanciona la publicidad de servidores privados de Pokemon Showdown. (Mute)
- **Porn:** sanciona los links pornográficos. (RoomBan)

En caso de cometerse una infracción múltiple, la sanción será la suma resultante de las sanciones por cada una de las infracciones. Por lo que no se recomienda que councidan banwords con la lista de inapropiate u otras sanciones.


Batallas, torneos y ladder
------------

El bot cuenta con un sistema mediante el cual puede aceptar retos de otros usuarios, participar en torneos o buscar batallas en ladder. Además, posee varios algoritmos para mejorar su comportamiento en los combates y para agilizar la toma de decisiones.

El módulo battle.js almacena la informacion de las batallas y llama a otros modulos que determinan el comportamiento del bot en los combates. Actualmente solo posee gen6-singles-default que consiste en un juego pseudo-random (ya que descarta los movimientos inútiles).
A la hora de aceptar retos, el bot aceptará todos los retos si está a `true` la opcion `acceptAll` de la configuración o si no está en ninguna otra batalla. También aceptará siempre los retos de aquellos que estén en la lista de excepciones.

Comandos para configurar las batllas automáticas:

 - `allowbattle [on/off]` - Activa o desactiva las batallas automáticas.
 - `allowbattleall [on/off]` - Si se activa, el bot acepta todos los retos.
 - `chall [usuario], [formato]` - Se utiliza para que el bot rete a un usuario.
 - `move` - Fuerza al bot a tomar una decision en una batalla si este no la toma.
 
El bot puede participar en torneos, para que participe, se debe hacer uno de los sigientes comandos:

 - `jointours [on/off]` - Activa o desactiva la participación del bot en torneos para una sala.
 - `jointour` - Fuerza al bot a unirse a un torneo.

Además, puede buscar batallas en el Ladder, usando el comando searchbattle:

 - `sb [formato]` - Busca una batalla en ladder y devuelve el link a esta.

En cuanto a el tema de los equipos, el bot puede jugar cualquier formato si bien es random o si posee algun equipo dentro de teams.js, donde se almacenan los equipos del bot. Hay tres formas de guardar un equipo en el array: Empaquetado (texto), JSON o con un generador de equipos aleatorios (mirar la ayuda en teams.js)


Torneos por puntos y tablas de resultados
------------

Este bot dispone de un sistema por el cual puede crear torneos de manera automática y, una vez termien, asignar unos puntos a los participantes en funcion de las rondas que ganaron con un plus al ganador del torneo.
Esto puede ser controlado en el archivo etourconfig.js, donde se establece la configuración de esta funcionalidad.

Además, existen una serie de comandos fundamentales a la hora de contrlar este sistema:

 - `etour [tier], [nombre], [minutos-incrpciones], [minutos-autodq]` - Crea un torneo en la sala de Eventos (también lo hace automáticamente, pero esto es más manual), lo anuncia en Español. Tras un tiempo o inicia y pone el autodq. Tras finalizar el torneo recuenta puntos y actualiza el ranking.
 - `etourstdin` - Entrada standard para los datos referentes a las puntuaciones.
 - `etourstdinplus` - Entrada standard con suma para los datos referentes a las puntuaciones.
 - `etourstdout` - Salida standard para los datos referentes a las puntuaciones.
 - `reloadtour` - Vuelve a leer el archivo del calendario.
 - `updatetourladder` - Crea una tabla con las 50 mejores puntuaciones y la sube a hastebin.
 - `cleartourladder` - Lo mismo que updatetourladder pero a parte borra los datos (usar con precaución).
 - `ladder` - Muestra el link a la última actualización de la tabla de resultados.
 - `rank [user]` - Muestra la puntuacion de un usuario.
 - `infotour` - Muestra la información del torneo por puntos del día.
 - `calendar` - Link a un tema del foro con el calendario explicado.
 
 
Créditos
------------

- Ecuacion (Desarrollo) 
- Quinella (Desarrollo del bot original)
- TalkTakesTime (Desarrollo del bot original)
- xJoelituh (Desarrollo)
