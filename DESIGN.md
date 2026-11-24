# ONE KNIGHT — Game Design Document
### A Reddit daily game for the Game of the Day Hackathon
**Team:** Daniel (representative, game logic & frontend) · Temi (data, testing, content ops)
**Deadline:** Submit evening of Mon 7 Dec 2026 (hard deadline 2:00am GMT, 9 Dec)
**Status:** v1.0 — for team review before any code is written

---

## 1. The pitch (one paragraph)

One knight. Controlled by everyone. Every day, the subreddit's shared knight faces one dilemma — a fight, a stranger, a temptation, a moral choice — and every player casts one vote on what the knight does. The majority decides. The knight's stats and personality change permanently based on the community's choices, until the knight dies and is remembered on the memorial wall with an obituary written by its own history: *"Sir Snoo the Merciless — survived 19 days, burned three villages, died refusing to abandon a farmer."* Then a new knight is named by the comments, and the story begins again. It's *Reigns* meets *Twitch Plays Pokémon*, built natively for Reddit.

## 2. Design pillars

1. **One vote, thirty seconds.** A session is: read today's card, vote, see yesterday's outcome, check the knight, leave. No friction, no tutorial.
2. **The comments are the arena.** Every choice is debatable. The game is engineered so that people argue — that's a feature, and it's what the judges' "Reddity" criterion rewards.
3. **Consequences, not branching.** There is no story tree. Choices modify persistent stats and personality, and stats change how future cards resolve. The community authors a character, not a path.
4. **Death is content.** Runs end. Obituaries are the shareable artifact. Resetting is a celebration, not a failure.
5. **The crowd is the id (the differentiator).** Solo games let one player be unhinged; One Knight lets a *community* be unhinged with diffusion of responsibility — nobody personally burned the village, 51% of everyone did. The game's real subject is mob morality. Design consequences:
   - **Vote receipts.** Every result leads with the split: *"61% of you burned the village."* The number is the content; it gets screenshotted and argued about.
   - **The minority is named (gently).** Result text acknowledges the losing side: *"The 39% who chose mercy are very quiet in the comments today."* Drives re-engagement without shaming.
   - **Personality axes are the community's mirror.** The knight's title ("the Merciless") is really the community's title. Obituaries read as verdicts on the crowd, not the character.
   - **Every dilemma card needs a defensible monster option.** If no reasonable person would ever vote for the cruel choice, the card is dead. Aim for 60/40 tension, not 95/5.

## 3. The core loop (daily)

```
Midnight UTC (scheduler job, runs automatically):
  1. Close yesterday's vote → tally → resolve outcome against knight's stats
  2. Apply stat/personality changes
  3. Check death → if dead: write obituary, start new run
  4. Draw today's card (seeded RNG → same card for every player worldwide)
  5. Post today's card to the subreddit

Player session (any time during the day):
  1. Open today's post → see the card + the knight's current sheet
  2. See how yesterday turned out (result card)
  3. Cast one vote (buttons, click-only — no drag, no typing needed)
  4. See live vote split (%) → jump to comments to argue
```

## 4. The knight: stats & personality

### Core stats (numbers, persistent across days)
| Stat | Start | What it does |
|---|---|---|
| HP | 20 | Death at 0. Restored by rest, shrines, potions. |
| Gold | 10 | Spent at merchants, stolen, gambled, offered. |
| Strength | 3 | Resolves combat and intimidation checks. |
| Luck | 3 | Modifies dice on risky choices. |

### Personality axes (−10 to +10, the Temi layer)
These never gate content directly — they colour outcomes and write the obituary. They are the "we see what people are truly like" mechanic.

| Axis | Poles | Raised by |
|---|---|---|
| Honour ↔ Ruthlessness | +10 = paragon / −10 = monster | Sparing vs. killing, keeping vs. breaking oaths |
| Courage ↔ Caution | +10 = fearless / −10 = craven | Fighting vs. fleeing, entering vs. avoiding |

### Derived identity
The game derives a title from the axes, shown on the knight sheet:
- Honour ≥ +5 → "the Just" · Honour ≤ −5 → "the Merciless"
- Courage ≥ +5 → "the Bold" · Courage ≤ −5 → "the Wary"
- Combinations get special titles: Honour high + Courage low → "the Kind Coward"; both low → "the Survivor"; both extremes → "the Legend".

### Check resolution (keep it dead simple)
`roll = d6 + relevant stat (+ luck bonus on risky cards)` vs. a difficulty number on the card. Success → success outcome. Fail → fail outcome. No complex maths visible to the player; the card shows the odds honestly ("Risky: needs 5+ on d6+STR").

## 5. The deck, not the tree

- Content is a **library of independent cards**. Each card is self-contained: situation, 2–3 choices, outcomes per choice. Cards never link to other cards.
- Each day the seeded RNG (seed = run number + day number) draws one undrawn card. When the deck is exhausted, it reshuffles — by then (6+ weeks later) the knight is a different character, so repeats play differently.
- **Variation slots** multiply the library: enemies, loot, locations and flavour pull from lists (`{bandit/wolf/tax collector/debt collector}`). One card file ≈ 10+ distinct feels.
- **Stat-dependence** multiplies it again: the same shrine card at 2 HP is a desperate prayer; at full HP it's a greed check.

### Card file format (this is the actual content format — a JSON file Temi and Daniel edit together)

```json
{
  "id": "wounded_squire_01",
  "title": "The Wounded Squire",
  "text": "A young squire lies bleeding by the road, clutching a sealed letter. \"Please... this must reach the capital. I can pay nothing.\"",
  "choices": [
    {
      "label": "Carry the letter (lose a day, −2 HP from exhaustion)",
      "effects": { "hp": -2, "honour": +2 },
      "result": "The knight delivers it. Somewhere, a family is spared ruin. The knight sleeps badly anyway."
    },
    {
      "label": "Take the letter and sell it (+15g)",
      "effects": { "gold": 15, "honour": -2 },
      "result": "A spy pays well for secrets. The knight counts coins and does not look back."
    },
    {
      "label": "Walk past",
      "effects": { "caution": +1 },
      "result": "The road is long and full of strangers. The knight keeps walking."
    }
  ]
}
```

### The 40-card launch library (target mix)
| Type | Count | Purpose |
|---|---|---|
| Moral dilemmas | 12 | The heart of the game (sacrifice, mercy, theft, oaths) |
| Combat encounters | 8 | Strength checks, HP risk, glory |
| Temptations | 6 | Greed, gambling, shortcuts — luck checks |
| Strangers & weirdos | 6 | Comic relief, unpredictable outcomes |
| Quiet days | 4 | Rest, train, reflect — stat tuning valves |
| Bosses | 4 | See below |

**Boss structure:** every 7th day the RNG draws from the boss pool instead. Bosses are harder checks with run-defining stakes (e.g., "The Debt Comes Due" — pay 50g or fight the Collector). Dying to a boss makes the best obituaries.

## 6. Death, obituaries, and the memorial wall

On death the scheduler writes the obituary automatically from the record:

> **Here lies Sir Snoo the Merciless.**
> Survived 19 days. Won 8 fights, fled 2. Spared no bandit.
> Died on day 19: refused to abandon a farmer, overwhelmed by debt collectors.
> Voted most loved choice: "Carry the letter" (64%).

- Memorial wall = a screen listing all past knights, newest first.
- The day after a death is a **Naming Day**: the post asks the comments to suggest names; top-upvoted name becomes the new knight. (Implementation: you two read the top comment and set the name — do not automate comment parsing in v1.)
- Player-facing streak: "days you've voted" per user. Community-facing streak: current knight's days alive, shown on every post.

## 7. Reddit integration (the "Reddity" checklist)

- **Interactive post** is the whole game (webview, click-only buttons).
- **Custom post preview** (`setCustomPostPreview`): today's card title visible in the feed — "Day 12: The Wounded Squire — 412 votes".
- **Comments:** results text deliberately invites argument ("64% of you chose mercy. The 36% are quiet today.")
- **Flair** (stretch): award "Kingmaker" flair to users with 7+ day vote streaks via the Reddit API.
- **Test subreddit** with <200 members for judging, per the rules.

## 8. Screens (5 — same small surface as before)

1. **Vote screen** — the card: title, art-emoji, flavour text, 2–3 choice buttons, live vote %, knight sheet strip (HP/gold/title), your voting streak.
2. **Result banner** (top of the same screen if you played yesterday) — how yesterday resolved.
3. **Knight sheet** — full stats, personality axes, title, days alive, run history summary.
4. **Memorial wall** — all dead knights + obituaries.
5. **Naming day variant** — prompt + link to comments.

## 9. Data model (Redis keys — Temi's domain)

```
run:current              → run number (int)
run:{n}:knight           → { name, hp, gold, str, luck, honour, caution, dayBorn }
run:{n}:day              → current day number
run:{n}:deck             → shuffled list of remaining card ids
run:{n}:log              → list of { day, cardId, choice, result } (feeds obituary)
day:{run}:{n}:card       → card id for that day
day:{run}:{n}:votes      → hash: choiceIndex → count
day:{run}:{n}:voted:{userId} → choiceIndex (one vote per user per day)
user:{userId}:streak     → consecutive days voted
user:{userId}:lastVote   → last day number voted
memorial                 → list of obituary objects (capped at 50)
```

Scheduler job at 00:00 UTC: tally → resolve → maybe death → draw → post. One job, always.

## 10. Content plan (the writing, not the code)

- **Weekend 1 target:** 20 cards drafted in a shared spreadsheet (columns = the JSON fields). Daniel drafts combat + temptations, Temi drafts dilemmas + strangers, swap and edit each other's.
- **Weekend 2 target:** 20 more + 4 bosses + variation word-lists (20 enemy names, 15 locations, 20 loot items).
- **Tone guide:** second person, present tense, dry wit, never punch down. Dark is fine; mean is not.
- Seeded first week: you control the exact first 7 cards (fixed order) so the opening week always tells a good story; RNG takes over from day 8.

## 11. Build order (3 weeks)

| When | Deliverable |
|---|---|
| **Week 1 (17–23 Nov)** | Devvit environment + starter template running in test sub. Vote screen rendering one hardcoded card. Votes saving to Redis. |
| **Week 2 (24–30 Nov)** | Scheduler resolve loop, stats & personality, deck draw with seeded RNG, result banner, knight sheet. 20 cards written. |
| **Checkpoint 3 Dec** | Full loop playable end-to-end on seeded cards. If not here → I take over heavy code, you two finish content + polish. |
| **Week 3 (1–7 Dec)** | Memorial wall, obituary writer, remaining cards + bosses, mobile polish pass, moderation review of card text, README, <1min video. **Submit Mon 7 Dec evening.** |

Stretch goals (only if ahead): naming-day automation, Kingmaker flair, boss word-duel minigame (the word-game hybrid, as a rare combat twist).

## 12. Risks & honest mitigations

| Risk | Mitigation |
|---|---|
| "40 cards isn't enough" | Variation slots + stat-dependence + reshuffle; 40 cards ≈ 6 weeks before any repeat |
| Vote brigading / low turnout days | Game works fine at 5 votes; outcomes don't require quorum |
| Players grief via coordinated cruelty | That's… the game. The obituary remembers. |
| Card text with edgy content | Both of you review every card against the tone guide; Temi owns final pass |
| Devvit webview quirks (click-only, no drag, light/dark) | Buttons only, one neutral theme, test on mobile early |

## 13. Why this wins (judging criteria map)

- **Delightful UX:** 30-second session, zero tutorial, instant legibility.
- **Polish:** tiny surface (5 screens, 40 JSON cards) — achievable polish is the whole point of the design.
- **Reddity:** cannot exist off Reddit; the community *is* the protagonist; comments are the arena.
- **Daily Content:** self-generating narrative; obituaries and naming days are recurring events, not just resets.
