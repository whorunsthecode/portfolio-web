/**
 * Long-form project case studies, keyed by modal id (matches the keys in
 * ProjectModal's PROJECTS map). Rendered below the CTA when the user taps
 * "Read the story" in each project modal.
 *
 * Terminus is the contact page and intentionally has no case study.
 */
export const CASE_STUDIES: Record<string, string> = {
  museum: `I live in Hong Kong. The paintings I love most live in Europe. Starry Night in New York, The Kiss in Vienna, The Night Watch in Amsterdam, Girl with a Pearl Earring in The Hague, Sunday on La Grande Jatte in Chicago. I will not see them this year. Probably not next year.

Even when I've been in front of them, it's never the experience you want. Ropes six feet back. Crowds behind you applying pressure. Glass glare. The Mona Lisa is essentially impossible to see properly. You take the photo, you move on, you don't really look.

Gesture Gallery is a private museum I built for myself. Five paintings I chose because they matter to me, hung in a 3D space I can walk through on my own time. You navigate with MediaPipe hand gestures through your webcam — zoom in with a pinch, pan with a drag, lean close to a brushstroke. Gemini 3 narrates in real time, interpreting whatever you're looking at.

Most digital museum tours are tragic. Click a thumbnail, read a caption, click next. The institutions with the greatest art in the world build the worst interactive experiences for it. Gesture is different because the gallery requires interaction — your body has to move. It forces presence.

What didn't fully work: some artworks don't tolerate extreme zoom. I curated around that constraint — pieces that reward closeness.

Lesson: for content-heavy experiences, the interaction model is the product. A better database UI won't fix a boring museum tour. Changing what the user's body does will.`,

  christmas: `Two-hour hackathon. I had 90 seconds to pick an idea.

What came out: what if the advent calendar had The Sims in it. You click "next day" and a new building appears on a snowy 3D village. Click the building and it plays like a Sims vignette — a tiny holiday scene with a branching storyline where your day-3 choices change what shows up on day 7.

It won Most Popular — voted by the other builders in the room, not judges. ~70 people shipping on the same 2-hour clock, and the thing that won wasn't the most technically clever. It was the one that looked like a real product.

Most builds were clever: smart prompts, interesting APIs, novel concepts. Most builds also looked like placeholders. The ideas inside were often better than mine. None had the "oh, I want to use this" moment in the 3 seconds it takes to scan a demo.

How I actually built it: brainstorm the concept for 20 minutes, chunk it into small prompts, feed Lovable one at a time. Gemini generated the storylines at runtime. My entire contribution was taste and sequencing.

Lesson: visuals are infrastructure, not decoration. And your job as a builder is no longer to write every line — it's to decide what the thing should be, and to know when the AI output is good enough to ship.`,

  fantasy: `For a month I had consistent nightmares. Poor sleep, worse days. I wanted to know if this was just me — so I went to r/dreams, 293,000 dreamers, and what I found wasn't a community journaling their subconscious. It was people in crisis, posting triggering dreams, asking strangers to interpret them.

A study of 44,000 dream reports found the top nightmare content is violence, sexual assault, demons, and blood. I tested existing dream interpretation apps with triggering inputs. None of them flagged crisis content. None redirected to resources. All of them used dark palettes — genuinely terrible UX for someone who just woke up panicked. And none of them spoke to the loneliness my generation actually feels.

So I built DreamDump. You talk to Drift — a cloud-shaped AI companion who reads your dream, responds in a warm Gen Z tone, helps you reflect. If you write something that trips the safety system, Drift gently redirects you to real crisis resources instead of offering a vibes-based "interpretation."

The hard decision was prioritizing safety over commercialization. Tight safety guardrails mean less flashy interpretations, less viral content, slower launch. I spent weeks tuning the flagging system — the breadth of graphic dream content is wider than you'd expect, and you have to know Gen Z language specifically to catch what matters.

Lesson: some products should not ship fast. Especially AI products that touch mental health. The thing most competitors get wrong isn't their model — it's that they optimize for engagement in categories where "engagement" is the warning sign.`,

  aquarium: `Less than an hour. That was the build window at Lonely Octopus Builder Night.

I met Matthew there and pitched the idea: what if a pomodoro timer grew a coral reef? Every focused session adds life to your reef — fish appear, coral branches, the ecosystem gets richer. Leave the tab and the reef knows. Page Visibility API detects the moment you switch away. Your reef stops growing. No honor system, no self-reporting. The browser is the accountability.

Matthew took the engineering. I took the product and design. The split worked because neither of us tried to do both — we scoped ruthlessly and divided by strength. I made the decisions about what the reef should look and feel like, what "progress" meant visually, and what to cut. He made it actually run.

The hard part wasn't building. It was scoping under pressure. When you have less than an hour, every feature you say yes to is a feature that might not ship. We cut animations. We cut sound. We cut a leaderboard. What survived was the core loop: focus, grow, leave, stop.

It won 2nd place, voted by builders and sponsored by MindWorks Capital.

Lesson: the best product decisions at a hackathon aren't what to build — they're what to kill. Scope is taste under pressure.`,

  gym: `Two bad habits that cancel each other out: I'm stiff, and I scroll too much. If only one could force the other to stop.

stiff does exactly that. When your screen time on blocked apps hits a daily threshold, those apps lock. To unlock them, you do a 2-minute stretch — MediaPipe watches through your front camera, overlays a skeleton, and confirms you actually moved. Finish the session, earn shrimp points, draw shrimp cards.

The name does the heavy lifting. "Shrimping" is Gen Z slang for sitting hunched over your phone in a shrimp-shaped curl. So the thing judging your posture IS a shrimp — specifically a tired, half-lidded, unimpressed one. When you stop moving, it roasts you in Gen Z slang.

The hardest part wasn't the concept. It was MediaPipe thresholds — strict enough to reject a fake stretch, loose enough to handle real ones in a messy bedroom. I cut rep counting entirely because phone cameras can't frame a full body at room distance.

The deliberate choice was using Apple's Screen Time / FamilyControls API for real system-level blocking instead of soft reminders. Soft reminders don't work. I know because every "screen time nudge" app I've installed got swiped past in 48 hours.

Lesson: gentle products don't change behavior. Real friction + real reward does. Adoption problems aren't solved by education — they're solved by redesigning the path of least resistance.`,
}
