Bot para las salas Español y Roleplay Español de PS
====================

En esta guía se explican los comandos y funcionalidades de este Bot.


Comandos
------------

Comandos Básicos: 

 - `about:` Explica lo más general del Bot. Es un comando identificativo.
 - `help:` Devuelve el link a esta guía.
 - `joke:` Devuelve un chiste en ingles.
 - `choose:` Elige entre varias opciones.
 - `seen:` Da información sobre la ultima vez que se vió a un usuario.
 - `helix:` Devuelve una respuesta aleatoria.
 - `b [texto]:` Devuelve el texto con link.
 - `gg:` Dice "No entiendo gg".
 - `poke:` Pone el data de un pokemon aleatorio.

Comandos Informativos: 

 - `info`
 - `liga`
 - `foro`
 - `faq`
 - `plug`
 - `suspect`
 - `torneo`
 - `voiced`
 - `vod`
 - `modchat`
 - `rangos`
 - `sanciones`
 - `reglas`
 - `staff`
 - `modchat`
 - `roleplay`
 - `modchat`
  
Comandos de Información sobre Pokemon: 

 - `randompoke`
 - `gen`
 - `trad`
 - `heavyslam`
 - `preevo`
 - `priority`
 - `boosting`
 - `recovery`
 - `hazards`
 - `typelearn`
  
Comandos de Moderacion:

 - `set:` Comando para cambiar permisos y moderación.
 - `ab:` Añade usuarios a la lista negra.
 - `unab:` Quita usuarios de la lista negra.
 - `vab:` Muestra la lista negra.
 - `zt:` Añade usuarios a cero tolerancia.
 - `unzt:` Quita usuarios de la lista de cero tolerancia.
 - `vzt:` Muestra la lista de cero tolerancia.
 - `banword:` Añade una frase a las banwords.
 - `unbanword:` Quita una frase de las banwords.
 - `vbw:` Muestra la lista de frases prohibidas.
 - `iw:` Añade una palabra a la lista de lenguaje inapropiado.
 - `uiw:` Quita una palabra de la lista de lenguaje inapropiado.
 - `viw:` Muestra la lista de lenguaje inapropiado.
 - `tourhelp:` Muestra como debe usarse el comando tour.
 - `tour:` Crea un torneo y lo incia automaticamente.
 - `logs:` Link con la guía de uso del Bot de Logs.
  
  
Comandos de Programación:

 - `updateserver:` Actualiza el bot de manera remota. Devuelve un log de estado.
 - `kill:` Apaga el bot. Se usa para reiniciar.
 - `reload:` Actualiza los comandos.
 - `reloadteams:` Actualiza los equipos del Bot.
 - `reloaddata:` Actualiza los datos sobre pokemon, movimientos, etc.
 - `js:` Introduce un script de manera temporal en el bot.

Comandos Administrativos Especiales:

 - `custom:` Controla lo que dice el Bot.
 - `say:` El bot dice algo personalizado, pero no se admiten comandos.
 - `allowbattle [on/off]:` Activa o desactiva las batallas automáticas.
 - `allowbattleall [on/off]:` Si se activa, el bot acepta todos los retos.
 - `move:` Fuerza al bot a tomar una decision en una batalla si este no la toma.
 - `jointours [on/off]:` Activa o desactiva la participación del bot en torneos random.
 - `jointour:` Fuerza al bot a unirse a un torneo.
 - `sb [formato]:` Busca una batalla en ladder y devuelve el link a esta.
 - `chall [usuario], [formato]:` Se utiliza para que el bot rete a un usuario.
 - `getauth [sala]:` Guarda el roomauth de una sala como si fuese rango global.
 - `jf [set/delete], [usuario], [frase]:` Establece una frase que el bot dice cuando cierto usuario entra a una sala.
 - `vjf:` Muestra las frases de entrada adjudicadas en una sala.

Comando **ic** para modificar comandos dinámicos

 - `ic [texto]` Guarda un texto para asignárselo a un comando.
 - `ic -v` Muestra el texto que hay guardado.
 - `ic -s [comando] [subcomando]` Crea o modifica un subcomando dinámico (por ejemplo info [subcomando] o suspect [subcomando]).
 - `ic -d [comando] [subcomando]` Borra un subcomando dinámico.


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

El bot cuenta con un sistema mediante el cual puede aceptar retos de otros usuarios, participar en torneos o buscar batallas en ladder. Además, posee varios algoritmos para mejorar su comportamiento en los combates y para agilizar la toma de decisiones. A pesar de esto, el estilo de combate del bot es aleatorio con una cierta mejora en las tiers individuales de la sexta generación.

Para controlar esta funcionalidad destacan los siguienes comandos:

 - `allowbattle [on/off]:` Activa o desactiva las batallas automáticas.
 - `allowbattleall [on/off]:` Si se activa, el bot acepta todos los retos.
 - `move:` Fuerza al bot a tomar una decision en una batalla si este no la toma.
 - `jointours [on/off]:` Activa o desactiva la participación del bot en torneos random.
 - `jointour:` Fuerza al bot a unirse a un torneo.
 - `sb [formato]:` Busca una batalla en ladder y devuelve el link a esta.
 - `chall [usuario], [formato]:` Se utiliza para que el bot rete a un usuario.
 

Créditos
------------

 - Quinella (Desarrollo del bot original)
 - Ecuacion (Desarrollo)
 - TalkTakesTime (Desarrollo del bot original)
 - xJoelituh (Desarrollo)
