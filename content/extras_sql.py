"""SQL questline: learners write real SQL against a small game-library database.

Every problem runs against two different datasets, so a hard-coded answer cannot pass.
Expected rows are produced by running the reference query in SQLite.
"""

SCHEMA = """CREATE TABLE players(id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL, joined TEXT NOT NULL);
CREATE TABLE games(id INTEGER PRIMARY KEY, title TEXT NOT NULL, genre TEXT NOT NULL, price REAL NOT NULL);
CREATE TABLE sessions(id INTEGER PRIMARY KEY, player_id INTEGER NOT NULL REFERENCES players(id), game_id INTEGER NOT NULL REFERENCES games(id), minutes INTEGER NOT NULL, played_on TEXT NOT NULL);
"""

DATA = [
    {
        "players": [(1, "Ana", "US", "2025-01-10"), (2, "Bo", "CA", "2025-02-03"), (3, "Chen", "CN", "2025-02-20"),
                    (4, "Dee", "US", "2025-03-15"), (5, "Eli", "DE", "2025-04-01"), (6, "Fay", "CA", "2025-05-12")],
        "games": [(1, "Hollow Quest", "Metroidvania", 15.0), (2, "Star Forge", "Strategy", 30.0), (3, "Pixel Farm", "Sim", 0.0),
                  (4, "Dungeon Quest II", "RPG", 20.0), (5, "Neon Drift", "Racing", 12.5), (6, "Deep Archive", "Puzzle", 8.0)],
        "sessions": [(1, 1, 1, 45, "2026-10-01"), (2, 1, 2, 30, "2026-10-02"), (3, 2, 1, 60, "2026-10-02"), (4, 3, 4, 120, "2026-10-03"),
                     (5, 1, 1, 25, "2026-10-04"), (6, 4, 3, 15, "2026-10-04"), (7, 2, 4, 90, "2026-10-05"), (8, 5, 2, 40, "2026-10-06"),
                     (9, 3, 1, 30, "2026-10-07"), (10, 4, 4, 75, "2026-10-07"), (11, 1, 4, 20, "2026-10-08"), (12, 6, 5, 50, "2026-10-09"),
                     (13, 2, 1, 10, "2026-10-10"), (14, 3, 4, 45, "2026-10-11")],
    },
    {
        "players": [(1, "Zed", "US", "2024-11-02"), (2, "Yui", "JP", "2025-01-15"), (3, "Xan", "CA", "2025-03-09"),
                    (4, "Wes", "US", "2025-06-30"), (5, "Val", "BR", "2025-07-04")],
        "games": [(1, "Quest for Glory", "RPG", 25.0), (2, "Tiny Tanks", "Action", 5.0), (3, "Free Fall", "Arcade", 0.0),
                  (4, "Rune Quest", "RPG", 40.0), (5, "Card Keep", "Cards", 18.0)],
        "sessions": [(1, 1, 2, 30, "2026-09-01"), (2, 2, 1, 80, "2026-09-01"), (3, 2, 1, 40, "2026-09-03"), (4, 3, 4, 100, "2026-09-04"),
                     (5, 1, 1, 20, "2026-09-05"), (6, 4, 2, 35, "2026-09-06"), (7, 3, 4, 15, "2026-09-07"), (8, 2, 2, 60, "2026-09-08"),
                     (9, 5, 1, 10, "2026-09-09"), (10, 1, 4, 55, "2026-09-10")],
    },
]


def fixture_sql(data):
    def lit(v):
        return "'" + v.replace("'", "''") + "'" if isinstance(v, str) else repr(v)
    out = [SCHEMA]
    for table in ("players", "games", "sessions"):
        for row in data[table]:
            out.append(f"INSERT INTO {table} VALUES ({', '.join(lit(v) for v in row)});")
    return "\n".join(out)


SCHEMA_NOTE = ("Tables: players(id, name, country, joined) · games(id, title, genre, price) · "
               "sessions(id, player_id → players.id, game_id → games.id, minutes, played_on). "
               "Dates are text in YYYY-MM-DD form.")

PROBLEMS = [
    dict(t="Every title", task="List the title of every game, in alphabetical order.",
         sol="SELECT title\nFROM games\nORDER BY title;",
         hints=["SELECT picks columns; FROM picks the table.", "ORDER BY title sorts A→Z."],
         concept="SELECT column FROM table is the shape of every query. Without ORDER BY, row order is not guaranteed."),
    dict(t="Cheap games", task="Return title and price for games cheaper than 20, ordered by price, then title.",
         sol="SELECT title, price\nFROM games\nWHERE price < 20\nORDER BY price, title;",
         hints=["WHERE filters rows before anything else.", "ORDER BY can take several columns, separated by commas."],
         concept="WHERE keeps only rows where the condition is true."),
    dict(t="North American players", task="Return the names of players from the US or CA, alphabetically.",
         sol="SELECT name\nFROM players\nWHERE country IN ('US', 'CA')\nORDER BY name;",
         hints=["You could use OR, or IN with a list.", "Text values go in single quotes."],
         concept="IN ('a', 'b') is shorthand for = 'a' OR = 'b'."),
    dict(t="Find the quests", task="Return the titles of games whose title contains the word Quest (any case), alphabetically.",
         sol="SELECT title\nFROM games\nWHERE title LIKE '%quest%'\nORDER BY title;",
         hints=["LIKE does pattern matching; % matches any run of characters.", "In SQLite, LIKE ignores case for plain English letters."],
         concept="LIKE '%word%' means 'contains word'."),
    dict(t="Overall totals", task="Return one row with two columns: the number of sessions (as sessions) and the total minutes played (as total_minutes).",
         sol="SELECT COUNT(*) AS sessions, SUM(minutes) AS total_minutes\nFROM sessions;",
         hints=["COUNT(*) counts rows; SUM(column) adds them.", "AS gives a column a name."],
         concept="Aggregate functions collapse many rows into one."),
    dict(t="Minutes per game", task="Return game_id and total minutes (as total) for each game that has sessions, ordered by total descending, then game_id.",
         sol="SELECT game_id, SUM(minutes) AS total\nFROM sessions\nGROUP BY game_id\nORDER BY total DESC, game_id;",
         hints=["GROUP BY game_id makes one row per game.", "ORDER BY total DESC puts the biggest first."],
         concept="GROUP BY splits rows into groups; aggregates then run once per group."),
    dict(t="Dedicated players", task="Return player_id and total minutes (as total) for players whose total is more than 100, ordered by player_id.",
         sol="SELECT player_id, SUM(minutes) AS total\nFROM sessions\nGROUP BY player_id\nHAVING SUM(minutes) > 100\nORDER BY player_id;",
         hints=["You can't use WHERE on an aggregate.", "HAVING filters groups after GROUP BY."],
         concept="WHERE filters rows before grouping; HAVING filters groups after."),
    dict(t="Price tiers", task="Return title and a tier column: 'free' when price is 0, 'budget' when under 20, otherwise 'premium'. Order by price, then title.",
         sol="SELECT title,\n       CASE WHEN price = 0 THEN 'free'\n            WHEN price < 20 THEN 'budget'\n            ELSE 'premium' END AS tier\nFROM games\nORDER BY price, title;",
         hints=["CASE WHEN … THEN … ELSE … END builds a value from conditions.", "Conditions are checked in order, like if/elif."],
         concept="CASE is SQL's if/elif/else."),
    dict(t="Who played what", task="For every session, return the player name, game title, and minutes, ordered by session id.",
         sol="SELECT p.name, g.title, s.minutes\nFROM sessions AS s\nJOIN players AS p ON p.id = s.player_id\nJOIN games AS g ON g.id = s.game_id\nORDER BY s.id;",
         hints=["JOIN connects tables through matching ids.", "Short aliases (s, p, g) keep queries readable."],
         concept="An INNER JOIN keeps rows that match on both sides."),
    dict(t="Most played titles", task="Return each game title with its total minutes (as total), for games with sessions, ordered by total descending, then title.",
         sol="SELECT g.title, SUM(s.minutes) AS total\nFROM sessions AS s\nJOIN games AS g ON g.id = s.game_id\nGROUP BY g.id\nORDER BY total DESC, g.title;",
         hints=["Join first, then group.", "Group by the game's id so two games with the same title would not merge."],
         concept="JOIN + GROUP BY is the most common reporting query you'll write at work."),
    dict(t="Including the unplayed", task="Return every game title with its number of sessions (as plays), including games with 0 sessions, ordered by title.",
         sol="SELECT g.title, COUNT(s.id) AS plays\nFROM games AS g\nLEFT JOIN sessions AS s ON s.game_id = g.id\nGROUP BY g.id\nORDER BY g.title;",
         hints=["A LEFT JOIN keeps every row from the left table.", "COUNT(s.id) skips NULLs, so unmatched games count 0. COUNT(*) would count 1."],
         concept="LEFT JOIN keeps unmatched left rows, with NULLs on the right."),
    dict(t="Never played", task="Return the titles of games that have no sessions, alphabetically.",
         sol="SELECT g.title\nFROM games AS g\nLEFT JOIN sessions AS s ON s.game_id = g.id\nWHERE s.id IS NULL\nORDER BY g.title;",
         hints=["Start from a LEFT JOIN.", "Unmatched rows have NULL on the right; test with IS NULL (never = NULL)."],
         concept="The 'anti-join': find rows with no match. NULL needs IS NULL."),
    dict(t="Above-average prices", task="Return title and price for games priced above the average game price, ordered by price descending, then title.",
         sol="SELECT title, price\nFROM games\nWHERE price > (SELECT AVG(price) FROM games)\nORDER BY price DESC, title;",
         hints=["Compute the average in a subquery.", "A subquery in parentheses can stand in for a single value."],
         concept="A scalar subquery returns one value you can compare against."),
    dict(t="Above-average players", task="Using a WITH (CTE) step, compute each player's total minutes, then return the names and totals (as total) of players whose total is above the average player total. Order by total descending, then name.",
         sol="WITH totals AS (\n    SELECT player_id, SUM(minutes) AS total\n    FROM sessions\n    GROUP BY player_id\n)\nSELECT p.name, t.total\nFROM totals AS t\nJOIN players AS p ON p.id = t.player_id\nWHERE t.total > (SELECT AVG(total) FROM totals)\nORDER BY t.total DESC, p.name;",
         hints=["WITH name AS (query) creates a temporary named result.", "Use it twice: once to join, once to compute the average."],
         concept="CTEs (WITH) break a complicated query into readable steps. Interviewers love them."),
    dict(t="Each player's longest session", task="For each player with sessions, return name, game title, and minutes of their longest session (ties go to the earlier session id). Order by name. Use ROW_NUMBER().",
         sol="WITH ranked AS (\n    SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY s.minutes DESC, s.id) AS rn\n    FROM sessions AS s\n)\nSELECT p.name, g.title, r.minutes\nFROM ranked AS r\nJOIN players AS p ON p.id = r.player_id\nJOIN games AS g ON g.id = r.game_id\nWHERE r.rn = 1\nORDER BY p.name;",
         hints=["ROW_NUMBER() OVER (PARTITION BY player ORDER BY minutes DESC) numbers each player's sessions.", "Keep rows where that number is 1."],
         concept="Window functions compute across related rows without collapsing them. 'Top N per group' is a classic interview question."),
    dict(t="Running totals", task="For each session, return player name, played_on, minutes, and a running total of that player's minutes (as running) ordered by played_on then session id. Order the output by name, then played_on, then session id.",
         sol="SELECT p.name, s.played_on, s.minutes,\n       SUM(s.minutes) OVER (PARTITION BY s.player_id ORDER BY s.played_on, s.id) AS running\nFROM sessions AS s\nJOIN players AS p ON p.id = s.player_id\nORDER BY p.name, s.played_on, s.id;",
         hints=["SUM(...) OVER (PARTITION BY … ORDER BY …) is a running sum.", "The window's ORDER BY decides the running order; the final ORDER BY decides output order."],
         concept="Running totals and rankings are where window functions shine."),
]
