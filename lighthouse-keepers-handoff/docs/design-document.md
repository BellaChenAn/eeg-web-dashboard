# Lighthouse Keepers: A Cooperative Neurofeedback Training Game for Children with ADHD

Tarunvir Randhawa, Juliann Zhu, Mane Muradyan, Bella Chen · CS 399 · 13 October 2026

> Source: the team's design document, transcribed to Markdown. Wording unchanged.

## Introduction

Lighthouse Keepers is a two-player cooperative game that uses electroencephalography (EEG) neurofeedback training (NFT) to help children with attention-deficit/hyperactivity disorder (ADHD) practice sustaining attention. The child wears a consumer EEG headset and plays the Keeper, whose attention powers a lighthouse beam that cuts through fog. A parent plays the Harbour Pilot and guides boats home through the water the beam lights up. Neither player can succeed alone. Neurofeedback brain-computer interfaces (BCIs) make normally invisible brain states visible in real time, and learning to regulate those states supports children's learning and mental health (Antle et al.). This document applies Fullerton's formal and dramatic game elements and evaluates the design against the strong concepts that Antle, Chesick, and McLaren derived from their Mind-Full system.

## Design Questions

### Who Is the User?

The primary user is a child aged about 7 to 12 with an ADHD diagnosis who plays at home. Children in this range can wear an adjustable headset, follow a spoken tutorial, and tap large targets. The secondary user is the parent, who plays the Pilot and adjusts the game settings. Antle et al. found that letting a second person adjust the system in real time is the most practical way to fit a neurofeedback game to a child without long calibration (sec. 5.4); here, the parent fills that role while also playing.

### What Is the Goal of the Design?

The goal is to give children with ADHD an enjoyable, regular way to practise sustained attention and to make that practice a shared activity with a parent. The game must show the child's attention level at every moment, reward attention held for several seconds rather than brief spikes, keep sessions relatively short, and give the parent a role that is enjoyable in its own right.

### What Problem Is the Design Trying to Solve?

Neurofeedback asks children to repeat a demanding task over many sessions, and abstract feedback such as a bar or number gives them little reason to return. Antle et al. note that children must understand how to change their brain state and must receive feedback they understand (sec. 2.2). In home training, the parent is also usually an observer who reminds the child to concentrate, which can turn practice into conflict. Finally, consumer headsets produce noisy data (Antle et al., sec. 2.2), so a game that reacts sharply to every change feels unfair. The design responds with a clear visual metaphor, a cooperative role for the parent, and feedback that changes gradually.

### How Will the Design Affect Its Users?

The child sees a direct link between an internal state and a visible result: focus widens the beam and moves the boats, while drifting attention narrows it and makes the boats wait. Over repeated sessions, this should help the child notice lapses and recover from them. Because no boat is ever lost, a lapse costs time but not progress, and the threshold rises gradually to keep the challenge in the range Fullerton associates with flow (ch. 4). The parent sees how hard focusing is and spends the session helping rather than correcting.

### What Is the Biggest Risk in This Idea?

The biggest risk is that the cooperative structure creates pressure: a frustrated parent may tell the child to "focus," turning the game into the correction it is meant to replace. The design reduces this by having no losing state, reporting only a team result, keeping the numeric attention score off the main screen, and giving parents encouraging phrases to use. Secondary risks are the noise in the headset's attention value, the child feeling like a power source while the parent makes the decisions, and the short six-week timeline, which the team addresses with signal smoothing, small choices for the child between rounds, and a defined minimum version.

## Session Structure

Each session represents one night at the harbour and lasts about twelve minutes:

1. **Lamp Lighting** (about one minute). The child puts on the headset, the lamp brightens as the signal improves, and the parent starts the night.
2. **Calm Waters** (about one minute). A warm-up with no boats, in which the child sees the beam respond and an on-screen guide shows a calm, upright posture for focusing.
3. **Three Tides** (three rounds of about three minutes, with short rests). Boats appear at the edge of the fog, the Pilot draws their routes, and hidden rocks appear only under a steady beam.
4. **The Storm Ship** (the end of the third tide). A large ship arrives in the thickest fog, and its safe channel can only be found with a steady beam.
5. **Dawn** (about one minute). The fog lifts, remaining boats are towed in, and a summary shows the passengers rescued. The child spends earned rewards on lighthouse decorations.

## EEG Component

Above the set threshold the beam widens; below it the beam narrows toward a glow but never goes dark. Holding attention for the full hold time creates a steady beam that reveals rocks, and three steady beams trigger a flare that lights the whole bay. Poor signal appears as frost on the lamp, and a keyboard simulator replaces the headset during development.

## Formal Game Elements

Following Fullerton (ch. 3), the game has two players in two required roles and uses cooperative play against the game system, with Lamp Lighting as the invitation to play. The main objective is rescue, with a secondary exploration objective, since revealed rocks stay on a chart of the bay. The core loop is simple: the Keeper holds attention, the beam widens, the Pilot draws a route, and the boat moves through lit water. Rules keep boats in lit water and let them wait in darkness instead of sinking. Light is the central resource, useful because boats need it and scarce because only sustained attention produces it. Conflict comes from obstacles, such as fog, rocks, and storm waves, and from the Pilot's dilemmas, such as choosing between a distant boat with many passengers and a nearby one with few. There are no opponents, and the non-zero-sum outcome is measured by passengers rescued compared with the family's own past sessions.

## Dramatic Game Elements

Fullerton describes flow as occurring when challenge matches ability (ch. 4), so the parent can raise or lower the threshold as the child improves. The beam gives clear goals and feedback, and the Keeper's lack of other inputs supports concentration. The main type of play is mimicry, since the child pretends to be a lighthouse keeper. The premise turns raising a number above a threshold into keeping a lighthouse lit so boats can get home, and the Keeper is a customizable avatar, which supports empathy (Fullerton, ch. 4). Each session follows a dramatic arc: Calm Waters is the exposition, the tides are the rising action, the Storm Ship is the climax, and Dawn is the resolution, so sessions end calmly.

## The Parent's Role

Only the child wears a headset, which keeps setup simple and makes the light clearly the Keeper's. The parent also uses a settings screen that shows a live attention graph, threshold controls, and signal quality, and makes adjustments between rounds so they do not interrupt the child, as Antle et al. recommend (sec. 5.4). Unlike in Mind-Full, the parent both plays and adjusts, so the Pilot's controls are silent and parents are asked to keep their talk short and positive.

## Evaluation Against the Neurofeedback Design Principles

Antle et al. identify five challenges for neurofeedback BCIs for children (sec. 2.2) and propose a strong concept for each (sec. 5), as summarized in Table 1.

**Table 1. Lighthouse Keepers and the Five Strong Concepts of Antle et al.**

| Strong concept | Application in Lighthouse Keepers | Status |
| --- | --- | --- |
| Body-brain embodied metaphors (sec. 5.1) | Focused attention is a steady light, supported by a taught upright posture. | Partly met |
| Dynamic, iconic feedback (sec. 5.2) | The beam changes continuously with attention, with a gentle posture hint when it dims. | Met |
| Brain-free input (sec. 5.3) | The Keeper has no input during rounds; the parent does all routing. | Met |
| Real-time distributed adaptation (sec. 5.4) | Mind-Full's defaults, adjusted by the parent with no calibration task. | Met |
| Design for imprecision (sec. 5.5) | Smoothing, gradual beam changes, boats that wait, and visible signal quality. | Met |

The interaction model is the weakest point. Mind-Full's Pinwheel game linked slow breathing directly to the target brain state (Antle et al., sec. 5.1), while attention as light relies more on everyday language, so playtesting will check whether children understand what makes the light brighter.

## Implementation Plan

The game will be a Phaser 3 and TypeScript web application, with a Node.js bridge that sends headset data to the game and settings screen over WebSockets. Over six weeks, the team will build the EEG bridge and simulator, the beam and boat loop, Pilot routing and special actions, and the settings screen, then playtest with classmates and polish for the final demonstration. The Storm Ship and decorations are optional if time runs short.

## Conclusion

Lighthouse Keepers turns attention training into a cooperative task in which a child's sustained attention produces the light a parent needs to bring boats home. It meets four of Antle et al.'s five strong concepts and partly meets the fifth.

## Works Cited

- Antle, Alissa N., et al. "Opening up the Design Space of Neurofeedback Brain-Computer Interfaces for Children." *ACM Transactions on Computer-Human Interaction*, vol. 24, no. 6, Jan. 2018, article 38, https://doi.org/10.1145/3131607.
- Fullerton, Tracy. *Game Design Workshop: A Playcentric Approach to Creating Innovative Games*. 5th ed., CRC Press, 2024.
- Game Elements: Formal and Dramatic. Microsoft Excel file, summary table of Fullerton, chapters 3 and 4, 2026.
