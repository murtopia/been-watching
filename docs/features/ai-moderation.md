# Been Watching - AI-Assisted Moderation System

**Date:** October 29, 2025
**Version:** 1.0
**Status:** Design Complete, Ready for Implementation
**Moderation Philosophy:** AI Analyzes, Human Decides

---

## Executive Summary

An AI-powered moderation system that analyzes user reports and provides recommendations, but **always requires human approval** before taking action. This approach combines the speed and consistency of AI with the judgment and context-awareness of human moderators.

**Key Principles:**
- 🤖 **AI Analyzes** - Instant analysis of reported content
- 👨 **Human Decides** - Final approval always required
- ⚡ **Fast Triage** - AI prioritizes urgent cases
- 📊 **Data-Driven** - AI learns from your decisions
- 🎯 **Consistent** - AI applies rules uniformly
- 🛡️ **Safe** - No automated bans or deletions

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [AI Analysis Components](#ai-analysis-components)
3. [Admin Decision Panel](#admin-decision-panel)
4. [Database Schema](#database-schema)
5. [Implementation Guide](#implementation-guide)
6. [API Integration](#api-integration)
7. [Cost Analysis](#cost-analysis)
8. [Privacy & Ethics](#privacy--ethics)

---

## How It Works

### Report Lifecycle with AI

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User Submits Report                            │
│ User clicks report → Selects category → Submits        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: AI Analysis (Automatic, <2 seconds)            │
│                                                         │
│ AI analyzes:                                            │
│  • Reported content (text, context)                    │
│  • Reporter's history (credible reporter?)             │
│  • Reported user's history (repeat offender?)          │
│  • Similar past cases (precedent)                      │
│                                                         │
│ AI generates:                                           │
│  • Severity score (0-100)                              │
│  • Category confidence (e.g., 95% harassment)          │
│  • Recommended action (warn/suspend/ban/dismiss)       │
│  • Explanation (why this recommendation)               │
│  • Similar cases (for context)                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Priority Queue (Automatic)                     │
│                                                         │
│ AI assigns priority:                                    │
│  🔴 URGENT (90-100 severity) - Immediate attention     │
│  🟡 HIGH (70-89 severity) - Review within 4 hours      │
│  🟢 NORMAL (40-69 severity) - Review within 24 hours   │
│  ⚪ LOW (0-39 severity) - Review when convenient       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Human Review (You decide)                      │
│                                                         │
│ Admin sees:                                             │
│  • AI recommendation + reasoning                       │
│  • Full context (content, history, patterns)          │
│  • Similar cases you've handled                        │
│                                                         │
│ Admin chooses:                                          │
│  ✅ Approve AI recommendation                          │
│  ✏️ Modify action (e.g., AI says ban, you say warn)   │
│  ❌ Dismiss report (AI was wrong)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Action Executed (Only after your approval)     │
│                                                         │
│ If you approve:                                         │
│  • User warned/suspended/banned                        │
│  • Content deleted (if banned)                         │
│  • Notification sent to user                           │
│  • Reporter notified (anonymously)                     │
│  • AI learns from your decision                        │
└─────────────────────────────────────────────────────────┘
```

---

## AI Analysis Components

### 1. Content Analysis

**What AI Analyzes:**
- Reported text (comment, activity, bio)
- Language toxicity (hate speech, threats, insults)
- Context (conversation thread, prior interactions)
- Intent detection (malicious vs. misunderstood)

**AI Models Used:**
- **OpenAI Moderation API** - Fast, accurate, free tier
- **Perspective API** (Google) - Toxicity scoring
- **GPT-4** - Context understanding for complex cases

**Example Analysis:**

```json
{
  "content": "You're such an idiot for liking that show",
  "toxicity_scores": {
    "insult": 0.92,
    "profanity": 0.15,
    "threat": 0.03,
    "severe_toxicity": 0.45
  },
  "moderation_categories": {
    "harassment": true,
    "hate_speech": false,
    "violence": false
  },
  "context_analysis": {
    "is_targeted": true,
    "is_repeated": false,
    "conversation_civility": "hostile"
  },
  "severity": 78,
  "confidence": 0.94
}
```

### 2. Pattern Detection

**What AI Looks For:**
- **Repeat Offenders:** Has this user been reported before?
- **Serial Reporters:** Does the reporter submit many false reports?
- **Coordinated Attacks:** Multiple users reporting same person
- **Spam Patterns:** Identical content, rapid posting
- **Harassment Campaigns:** Targeting specific users repeatedly

**Example Pattern:**

```json
{
  "pattern_type": "repeat_offender",
  "evidence": {
    "previous_warnings": 2,
    "previous_reports": 5,
    "time_span": "14 days",
    "similar_violations": [
      {
        "date": "2025-10-20",
        "content": "Your taste is trash",
        "action": "warning"
      },
      {
        "date": "2025-10-15",
        "content": "You're so dumb",
        "action": "warning"
      }
    ]
  },
  "recommendation": "Consider suspension (3rd offense)",
  "escalation_reason": "Pattern of harassment despite prior warnings"
}
```

### 3. Precedent Matching

**What AI Does:**
- Finds similar cases you've already decided
- Shows how you handled comparable situations
- Ensures consistency in enforcement
- Learns your moderation style over time

**Example:**

```json
{
  "similar_cases": [
    {
      "report_id": 142,
      "date": "2025-10-22",
      "similarity": 0.89,
      "content": "You have terrible taste in shows",
      "your_decision": "warning",
      "your_reasoning": "First offense, mild insult, warning appropriate"
    },
    {
      "report_id": 118,
      "date": "2025-10-10",
      "similarity": 0.76,
      "content": "What an idiotic opinion",
      "your_decision": "dismiss",
      "your_reasoning": "Disagreement with opinion, not personal attack"
    }
  ],
  "consistency_check": "Current case more severe than #142, warning or higher recommended"
}
```

### 4. Recommendation Engine

**AI Generates:**
- **Recommended Action:** Dismiss, Warn, Suspend (1d/7d/30d), Ban
- **Confidence Level:** How sure the AI is (0-100%)
- **Reasoning:** Plain English explanation
- **Risk Assessment:** What happens if we don't act?

**Example Recommendation:**

```json
{
  "recommended_action": "suspend_7d",
  "confidence": 87,
  "reasoning": [
    "Content contains direct personal insult (toxicity: 92%)",
    "User has 2 prior warnings for similar behavior",
    "Follows 3-strike policy (this is 3rd offense)",
    "Pattern shows escalation despite prior warnings"
  ],
  "alternative_actions": [
    {
      "action": "warning",
      "rationale": "If you consider this a borderline case",
      "risk": "Medium - May encourage further violations"
    },
    {
      "action": "suspend_30d",
      "rationale": "If you view this as severe harassment",
      "risk": "Low - Stronger deterrent"
    }
  ],
  "risk_if_dismissed": {
    "level": "high",
    "explanation": "User likely to continue harassment based on pattern"
  }
}
```

---

## Admin Decision Panel

### Panel Layout (`/admin/moderation/reports/:reportId`)

```
┌──────────────────────────────────────────────────────────────────┐
│  🤖 AI-ASSISTED MODERATION REVIEW                            ✕  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Report #147 | Priority: 🔴 URGENT | Status: PENDING           │
│  Submitted: 10 minutes ago by @gooduser                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  🤖 AI RECOMMENDATION                                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Recommended Action: SUSPEND 7 DAYS                    │     │
│  │  Confidence: 87%                                        │     │
│  │  Severity Score: 78/100                                │     │
│  │                                                         │     │
│  │  Why?                                                   │     │
│  │  • Direct personal insult detected (toxicity: 92%)     │     │
│  │  • User has 2 prior warnings (3-strike policy)         │     │
│  │  • Pattern shows escalation despite warnings           │     │
│  │  • Similar case #142: You suspended for 7 days         │     │
│  │                                                         │     │
│  │  Risk if dismissed: HIGH                               │     │
│  │  User likely to continue harassment based on pattern   │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  📄 REPORTED CONTENT                                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  @problematicuser commented:                           │     │
│  │  "You're such an idiot for liking this show.           │     │
│  │   Your taste is completely trash."                     │     │
│  │                                                         │     │
│  │  On: @gooduser's activity about The Office             │     │
│  │  Posted: Today at 3:42 PM                              │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  📊 AI TOXICITY ANALYSIS                                         │
│  Insult: ████████████████░░ 92%                                │
│  Threat: ██░░░░░░░░░░░░░░░░ 3%                                 │
│  Severe: ████████░░░░░░░░░░ 45%                                │
│  Profanity: ███░░░░░░░░░░░░░░░ 15%                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  👤 REPORTED USER PROFILE                                        │
│  Username: @problematicuser                                     │
│  Joined: 2 weeks ago                                            │
│  Total Comments: 42 | Ratings: 28 | Followers: 3               │
│                                                                  │
│  ⚠️ MODERATION HISTORY                                          │
│  • Warning #1: Oct 15 - "Your opinion is dumb" (harassment)    │
│  • Warning #2: Oct 20 - "You have trash taste" (harassment)    │
│  • This would be 3rd offense → Suspension recommended          │
│                                                                  │
│  [View Full Profile] [View All Comments]                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  🔍 CONTEXT & PATTERNS                                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Pattern Detected: TARGETED HARASSMENT                 │     │
│  │                                                         │     │
│  │  This user has commented on @gooduser's content        │     │
│  │  8 times in the past 3 days:                           │     │
│  │  • 5 negative comments                                 │     │
│  │  • 3 neutral comments                                  │     │
│  │                                                         │     │
│  │  Recent Comments on @gooduser's content:               │     │
│  │  • 2 hours ago: "Seriously? You like that garbage?"    │     │
│  │  • 1 day ago: "Typical. Bad taste as always."         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  📚 SIMILAR CASES YOU'VE DECIDED                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Case #142 (Oct 22) - 89% similar                     │     │
│  │  Content: "You have terrible taste in shows"           │     │
│  │  Your Decision: 7-day suspension                       │     │
│  │  Your Note: "2nd warning, consistent with policy"     │     │
│  │                                                         │     │
│  │  Case #118 (Oct 10) - 76% similar                     │     │
│  │  Content: "What an idiotic opinion"                    │     │
│  │  Your Decision: Warning only                           │     │
│  │  Your Note: "First offense, borderline"               │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ⚖️ YOUR DECISION (Required)                                    │
│                                                                  │
│  Quick Actions:                                                  │
│  [✅ Accept AI Recommendation (7-day suspension)]               │
│                                                                  │
│  Or Choose Different Action:                                     │
│  ○ Dismiss Report (no violation)                                │
│  ○ Warning Only (1st/2nd offense)                               │
│  ○ Suspend 1 Day (mild violation)                               │
│  ● Suspend 7 Days (moderate violation) ← AI recommends          │
│  ○ Suspend 30 Days (severe violation)                           │
│  ○ Permanent Ban (extreme or 4th+ offense)                      │
│                                                                  │
│  ☑️ Delete reported content                                     │
│  ☑️ Hide all user content (if banning)                          │
│                                                                  │
│  Your Reasoning (optional but recommended):                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Following 3-strike policy. User ignored prior warnings│     │
│  │ and continued targeted harassment.                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  [Cancel]                                   [Execute Decision]   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Features of Decision Panel

**1. AI Recommendation Prominent:**
- Shows AI's suggested action clearly
- Confidence level visible
- Plain-English reasoning
- But NOT pre-selected (you must actively choose)

**2. Full Context Available:**
- Original reported content
- User history (warnings, strikes)
- Pattern detection results
- Your past decisions on similar cases

**3. Quick Accept Option:**
- "Accept AI Recommendation" button for efficiency
- Still requires you to click (not auto-approved)
- Can add your own notes

**4. Easy Override:**
- Can choose any action (not limited to AI's suggestion)
- All options clearly visible
- Can be more lenient or more strict

**5. Learning Loop:**
- AI tracks when you agree/disagree
- Learns your style over time
- Improves recommendations

---

## Database Schema

### Enhanced Schema with AI Fields

```sql
-- ============================================
-- REPORTS TABLE (Enhanced with AI)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who/What reported (same as before)
  reporter_user_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  reported_activity_id UUID REFERENCES activities(id),
  reported_comment_id UUID REFERENCES comments(id),
  reported_show_note_id UUID REFERENCES show_comments(id),

  -- Report details
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'harassment',
    'hate_speech',
    'inappropriate_content',
    'impersonation',
    'other'
  )),
  description TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'actioned',
    'dismissed'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN (
    'low',
    'normal',
    'high',
    'urgent'
  )),

  -- 🤖 AI ANALYSIS FIELDS (NEW)
  ai_analyzed BOOLEAN DEFAULT false,
  ai_analysis_completed_at TIMESTAMPTZ,
  ai_severity_score INTEGER CHECK (ai_severity_score BETWEEN 0 AND 100),
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence BETWEEN 0 AND 1),
  ai_recommended_action TEXT CHECK (ai_recommended_action IN (
    'dismiss',
    'warn',
    'suspend_1d',
    'suspend_7d',
    'suspend_30d',
    'ban'
  )),
  ai_reasoning JSONB, -- Detailed explanation
  ai_toxicity_scores JSONB, -- Toxicity breakdown
  ai_pattern_detected TEXT, -- Pattern type if found
  ai_similar_cases JSONB, -- Array of similar past cases

  -- Admin review (same as before)
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_decision TEXT, -- What admin actually chose
  admin_agreed_with_ai BOOLEAN, -- Did admin accept AI recommendation?
  admin_reasoning TEXT, -- Admin's explanation
  dismissal_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT report_target_check CHECK (
    (reported_user_id IS NOT NULL)::INTEGER +
    (reported_activity_id IS NOT NULL)::INTEGER +
    (reported_comment_id IS NOT NULL)::INTEGER +
    (reported_show_note_id IS NOT NULL)::INTEGER = 1
  )
);

-- Indexes
CREATE INDEX idx_reports_ai_analyzed ON reports(ai_analyzed, status);
CREATE INDEX idx_reports_severity ON reports(ai_severity_score DESC, created_at DESC);
CREATE INDEX idx_reports_admin_agreement ON reports(admin_agreed_with_ai) WHERE admin_agreed_with_ai IS NOT NULL;

-- ============================================
-- AI LEARNING TABLE (Track AI Performance)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_moderation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id),

  -- What AI recommended
  ai_action TEXT NOT NULL,
  ai_confidence DECIMAL(3,2),
  ai_severity INTEGER,

  -- What human decided
  human_action TEXT NOT NULL,
  human_reasoning TEXT,

  -- Agreement tracking
  agreed BOOLEAN GENERATED ALWAYS AS (ai_action = human_action) STORED,
  confidence_was_appropriate BOOLEAN, -- Optional: Admin can mark if AI was overconfident

  -- Learning signals
  feedback_type TEXT CHECK (feedback_type IN (
    'correct',      -- AI was right
    'too_harsh',    -- AI over-reacted
    'too_lenient',  -- AI under-reacted
    'missed_context' -- AI missed important context
  )),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_feedback_agreed ON ai_moderation_feedback(agreed, created_at DESC);

-- ============================================
-- AI MODERATION STATS VIEW
-- ============================================
CREATE VIEW ai_moderation_stats AS
SELECT
  COUNT(*) as total_reports_analyzed,
  AVG(CASE WHEN admin_agreed_with_ai THEN 1.0 ELSE 0.0 END) as agreement_rate,
  AVG(ai_confidence) as avg_confidence,
  AVG(CASE WHEN admin_agreed_with_ai THEN ai_confidence ELSE NULL END) as avg_confidence_when_correct,
  AVG(CASE WHEN NOT admin_agreed_with_ai THEN ai_confidence ELSE NULL END) as avg_confidence_when_wrong
FROM reports
WHERE ai_analyzed = true
AND reviewed_by IS NOT NULL;
```

---

## Implementation Guide

### Phase 1: Basic AI Analysis (Week 1)

**Goal:** AI analyzes reports and provides recommendations

**Tasks:**

1. **Set up AI APIs:**
```bash
npm install openai @anthropic-ai/sdk @google-cloud/language
```

2. **Create AI analysis service:**
```typescript
// utils/ai/moderation-analyzer.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeReport(report: Report) {
  // 1. Content moderation check (OpenAI)
  const moderation = await openai.moderations.create({
    input: report.content
  });

  // 2. Toxicity analysis (Perspective API)
  const toxicity = await analyzeToxicity(report.content);

  // 3. Pattern detection (database queries)
  const patterns = await detectPatterns(report.reported_user_id);

  // 4. Find similar cases
  const similarCases = await findSimilarCases(report);

  // 5. Generate recommendation
  const recommendation = await generateRecommendation({
    moderation,
    toxicity,
    patterns,
    similarCases,
    userHistory: report.user_history
  });

  return {
    severity: recommendation.severity,
    confidence: recommendation.confidence,
    recommended_action: recommendation.action,
    reasoning: recommendation.reasoning,
    toxicity_scores: toxicity,
    pattern_detected: patterns.type,
    similar_cases: similarCases
  };
}
```

3. **Trigger AI analysis on report submission:**
```typescript
// app/api/reports/submit/route.ts
export async function POST(request: Request) {
  const { reported_id, reason, description } = await request.json();

  // 1. Create report in database
  const { data: report } = await supabase
    .from('reports')
    .insert({ reported_user_id: reported_id, reason, description })
    .select()
    .single();

  // 2. Trigger AI analysis (async)
  await analyzeReportAsync(report.id);

  return Response.json({ success: true, report_id: report.id });
}

async function analyzeReportAsync(reportId: string) {
  try {
    // Get full report context
    const report = await getReportWithContext(reportId);

    // Run AI analysis
    const analysis = await analyzeReport(report);

    // Update report with AI analysis
    await supabase
      .from('reports')
      .update({
        ai_analyzed: true,
        ai_analysis_completed_at: new Date().toISOString(),
        ai_severity_score: analysis.severity,
        ai_confidence: analysis.confidence,
        ai_recommended_action: analysis.recommended_action,
        ai_reasoning: analysis.reasoning,
        ai_toxicity_scores: analysis.toxicity_scores,
        ai_pattern_detected: analysis.pattern_detected,
        ai_similar_cases: analysis.similar_cases,
        priority: calculatePriority(analysis.severity) // Auto-set priority
      })
      .eq('id', reportId);

  } catch (error) {
    console.error('AI analysis failed:', error);
    // Report still shows in queue, just without AI analysis
  }
}
```

### Phase 2: Admin Decision Panel (Week 2)

**Goal:** Build UI for you to review AI recommendations

**Component:**
```typescript
// components/admin/ReportReviewPanel.tsx
'use client'

import { useState } from 'react'

export function ReportReviewPanel({ report }: { report: Report }) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [reasoning, setReasoning] = useState('')
  const [deleteContent, setDeleteContent] = useState(true)
  const [hideAllContent, setHideAllContent] = useState(true)

  const handleAcceptAI = () => {
    setSelectedAction(report.ai_recommended_action)
  }

  const handleSubmit = async () => {
    await fetch('/api/admin/moderation/execute', {
      method: 'POST',
      body: JSON.stringify({
        report_id: report.id,
        action: selectedAction,
        reasoning,
        delete_content: deleteContent,
        hide_all_content: selectedAction === 'ban' && hideAllContent,
        agreed_with_ai: selectedAction === report.ai_recommended_action
      })
    })

    // Redirect to next report or queue
    router.push('/admin/moderation/reports')
  }

  return (
    <div className="report-review-panel">
      {/* AI Recommendation Section */}
      <div className="ai-recommendation">
        <h3>🤖 AI Recommendation</h3>
        <div className="recommendation-card">
          <div className="action">
            {formatAction(report.ai_recommended_action)}
          </div>
          <div className="confidence">
            Confidence: {(report.ai_confidence * 100).toFixed(0)}%
          </div>
          <div className="severity">
            Severity: {report.ai_severity_score}/100
          </div>
          <div className="reasoning">
            <h4>Why?</h4>
            <ul>
              {report.ai_reasoning.reasons.map((reason: string) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
        <button onClick={handleAcceptAI}>
          ✅ Accept AI Recommendation
        </button>
      </div>

      {/* Reported Content */}
      <div className="reported-content">
        <h3>📄 Reported Content</h3>
        <div className="content-card">
          {report.content}
        </div>
      </div>

      {/* Toxicity Analysis */}
      <div className="toxicity-analysis">
        <h3>📊 AI Toxicity Analysis</h3>
        <ToxicityBars scores={report.ai_toxicity_scores} />
      </div>

      {/* User History */}
      <div className="user-history">
        <h3>⚠️ Moderation History</h3>
        <ModerationHistory userId={report.reported_user_id} />
      </div>

      {/* Similar Cases */}
      {report.ai_similar_cases && (
        <div className="similar-cases">
          <h3>📚 Similar Cases You've Decided</h3>
          <SimilarCasesList cases={report.ai_similar_cases} />
        </div>
      )}

      {/* Your Decision */}
      <div className="decision-section">
        <h3>⚖️ Your Decision (Required)</h3>

        <div className="action-options">
          <label>
            <input
              type="radio"
              value="dismiss"
              checked={selectedAction === 'dismiss'}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
            Dismiss Report (no violation)
          </label>
          <label>
            <input
              type="radio"
              value="warn"
              checked={selectedAction === 'warn'}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
            Warning Only (1st/2nd offense)
          </label>
          <label>
            <input
              type="radio"
              value="suspend_1d"
              checked={selectedAction === 'suspend_1d'}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
            Suspend 1 Day (mild)
          </label>
          <label>
            <input
              type="radio"
              value="suspend_7d"
              checked={selectedAction === 'suspend_7d'}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
            Suspend 7 Days (moderate)
            {report.ai_recommended_action === 'suspend_7d' && ' ← AI recommends'}
          </label>
          <label>
            <input
              type="radio"
              value="suspend_30d"
              checked={selectedAction === 'suspend_30d'}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
            Suspend 30 Days (severe)
          </label>
          <label>
            <input
              type="radio"
              value="ban"
              checked={selectedAction === 'ban'}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
            Permanent Ban (extreme/4th+ offense)
          </label>
        </div>

        <div className="additional-options">
          <label>
            <input
              type="checkbox"
              checked={deleteContent}
              onChange={(e) => setDeleteContent(e.target.checked)}
            />
            Delete reported content
          </label>

          {selectedAction === 'ban' && (
            <label>
              <input
                type="checkbox"
                checked={hideAllContent}
                onChange={(e) => setHideAllContent(e.target.checked)}
              />
              Hide all user content (ban only)
            </label>
          )}
        </div>

        <div className="reasoning-input">
          <label>Your Reasoning (optional but recommended):</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain your decision..."
            rows={3}
          />
        </div>

        <div className="action-buttons">
          <button onClick={() => router.back()}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAction}
            className="primary"
          >
            Execute Decision
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Phase 3: Learning Loop (Week 3+)

**Goal:** AI learns from your decisions

**Feedback System:**
```typescript
// After admin makes decision
async function recordAIFeedback(report: Report, adminDecision: string, adminReasoning: string) {
  await supabase
    .from('ai_moderation_feedback')
    .insert({
      report_id: report.id,
      ai_action: report.ai_recommended_action,
      ai_confidence: report.ai_confidence,
      ai_severity: report.ai_severity_score,
      human_action: adminDecision,
      human_reasoning: adminReasoning,
      // AI auto-calculates 'agreed' via generated column
    })

  // Optional: Periodically retrain AI model with feedback
  // This happens in background, not in real-time
}
```

---

## API Integration

### OpenAI Moderation API (Primary)

**Why OpenAI:**
- ✅ Free tier (1M tokens/month)
- ✅ Fast (<1 second)
- ✅ High accuracy
- ✅ Simple API

**Categories Detected:**
- Harassment
- Hate speech
- Self-harm
- Sexual content
- Violence

**Example:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function moderateContent(text: string) {
  const response = await openai.moderations.create({
    input: text,
  });

  const result = response.results[0];

  return {
    flagged: result.flagged,
    categories: result.categories,
    category_scores: result.category_scores,
    // Example output:
    // {
    //   flagged: true,
    //   categories: { harassment: true, hate: false, ... },
    //   category_scores: { harassment: 0.92, hate: 0.05, ... }
    // }
  };
}
```

### Perspective API (Secondary)

**Why Perspective:**
- ✅ Toxicity scoring (0-1 scale)
- ✅ Multiple attributes (insult, threat, profanity)
- ✅ Free tier (1 QPS)

**Example:**
```typescript
import { google } from 'googleapis';

const perspective = google.commentanalyzer('v1alpha1');

async function analyzeToxicity(text: string) {
  const response = await perspective.comments.analyze({
    key: process.env.PERSPECTIVE_API_KEY,
    requestBody: {
      comment: { text },
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        INSULT: {},
        THREAT: {},
        PROFANITY: {},
      },
    },
  });

  return {
    toxicity: response.data.attributeScores.TOXICITY.summaryScore.value,
    severe_toxicity: response.data.attributeScores.SEVERE_TOXICITY.summaryScore.value,
    insult: response.data.attributeScores.INSULT.summaryScore.value,
    threat: response.data.attributeScores.THREAT.summaryScore.value,
    profanity: response.data.attributeScores.PROFANITY.summaryScore.value,
  };
}
```

### GPT-4 for Context (Advanced)

**When to Use:**
- Complex cases needing context understanding
- Sarcasm detection
- Conversation thread analysis

**Example:**
```typescript
async function analyzeComplexCase(report: Report) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a content moderation assistant for a TV/movie social platform.
Analyze the reported content and provide a recommendation.

Guidelines:
- Disagreement with opinions is NOT harassment
- Personal insults ARE harassment
- Consider context and conversation history
- Follow 3-strike policy (warn → suspend → ban)

Respond in JSON format:
{
  "recommended_action": "dismiss|warn|suspend_7d|suspend_30d|ban",
  "severity": 0-100,
  "confidence": 0-1,
  "reasoning": ["reason 1", "reason 2", ...]
}`
      },
      {
        role: "user",
        content: `Reported Content: "${report.content}"
Context: ${report.context}
User History: ${report.user_history}
Reporter's Comment: "${report.description}"`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

## Cost Analysis

### API Costs (Estimated Monthly)

**Alpha Stage (100 reports/month):**
- OpenAI Moderation: **$0** (free tier)
- Perspective API: **$0** (free tier)
- GPT-4 (if needed): **~$5** (rare usage)
- **Total: ~$5/month**

**Beta Stage (1,000 reports/month):**
- OpenAI Moderation: **$0** (still free)
- Perspective API: **$0** (still free)
- GPT-4: **~$50** (10% of cases)
- **Total: ~$50/month**

**Scale Stage (10,000 reports/month):**
- OpenAI Moderation: **$0-10** (may exceed free tier)
- Perspective API: **$0-20** (may need paid tier)
- GPT-4: **~$500** (complex cases)
- **Total: ~$530/month**

**Break-Even Analysis:**
- Human moderation: ~5 minutes per report = $15/hour × 5 min = $1.25/report
- At 1,000 reports/month: **$1,250** in human time
- AI cost: **$50/month**
- **Savings: $1,200/month (96% reduction)**

---

## Privacy & Ethics

### Data Privacy

**What AI Sees:**
- ✅ Reported content (text only)
- ✅ Context (conversation, thread)
- ❌ User email addresses
- ❌ User real names
- ❌ User IP addresses

**Data Retention:**
- OpenAI: 30 days (then deleted)
- Perspective: Not stored by Google
- Your database: Indefinite (legal compliance)

### Ethical Considerations

**1. Transparency:**
- Users know AI is involved (Community Guidelines disclosure)
- AI recommendations visible to admin (not hidden)
- Human makes final decision (not automated)

**2. Fairness:**
- AI doesn't see user demographics
- Consistent application of rules
- Your decisions train AI (ensures your values)

**3. Appeal Process:**
- Users can appeal any decision
- You review appeals personally
- Can override AI + admin decision

**4. Bias Mitigation:**
- Regular audits of AI decisions
- Track accuracy by category
- Adjust if patterns emerge

---

## Next Steps

### Week 1: Foundation
1. **Set up API keys:**
   - OpenAI API key
   - Perspective API key (Google Cloud)
   - Add to `.env.local`

2. **Database migrations:**
   - Add AI fields to `reports` table
   - Create `ai_moderation_feedback` table
   - Create `ai_moderation_stats` view

3. **Basic AI integration:**
   - Create `analyzeReport()` function
   - Trigger on report submission
   - Store results in database

### Week 2: Admin UI
1. **Build decision panel:**
   - AI recommendation display
   - Full context view
   - Action selection
   - Submit decision

2. **Reports queue:**
   - Sort by AI severity
   - Color-code by priority
   - Show AI confidence

### Week 3: Learning & Polish
1. **Feedback loop:**
   - Track agreement rate
   - Log AI performance
   - Generate monthly reports

2. **Optimization:**
   - Fine-tune severity thresholds
   - Adjust confidence levels
   - Improve pattern detection

---

## Questions Answered

✅ **Moderation:** AI-driven analysis, you make final decisions
✅ **3 Strikes:** Confirmed (warn → warn → suspend/ban)
✅ **Banned Users:** All content hidden from public view
✅ **Appeals Email:** appeals@beenwatching.com
✅ **Auto-Actions:** None - you approve everything

---

**Document Status:** ✅ Complete and Ready
**Version:** 1.0
**Date:** October 29, 2025
**Ready to Build:** Yes! 🚀
