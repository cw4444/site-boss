export interface ExtractedData {
  client_name: string;
  client_location: string;
  job_type: string;
  materials: { item: string; quantity: string }[];
  labor_hours: string;
  financials: {
    quoted: string;
    materials_cost: string;
    profit_margin: string;
  };
  action_items: string[];
  status: "completed" | "in_progress" | "follow_up_needed";
  vibe: "stressed" | "relaxed" | "neutral";
}

export interface ProcessedResult {
  extracted: ExtractedData;
  email_draft: string;
  json_output: string;
}

export const DEMO_TRANSCRIPTS = [
  {
    label: "Stressed Roofer — Mrs. Higgins",
    icon: "🏠",
    transcript: `Right so just finished at Mrs Higgins place up in Roundhay, absolute nightmare mate. The felt was knackered worse than I thought, ended up using 3 rolls instead of 2. Was up there about 4 hours in the end, quote was only for 2 but what can you do. Quote was £450 but I'm gonna have to have a word with her about the extra materials, probably looking at another £80 on top. Need to get more felt from Wickes before Monday cos I've got that job in Headingley. Oh and the flashing round the chimney needs looking at too, told her I'd come back next week for that. Bloody freezing up there today.`,
  },
  {
    label: "Relaxed Plumber — Dave's Bathroom",
    icon: "🔧",
    transcript: `Yeah all done at Dave's place in Meanwood, lovely job that. New basin and taps fitted, took about 2 hours, dead straightforward. Used the Grohe mixer tap he wanted, the one from Screwfix, think it was about £85 for the tap. Charged him £220 all in, he's well happy. Said he might want me back to look at the en-suite in a few weeks. Nice fella Dave, made me a brew and everything. Just need to send him the receipt and maybe a wee follow up in a couple of weeks about that en-suite.`,
  },
  {
    label: "Electrician — Kitchen Rewire",
    icon: "⚡",
    transcript: `So the kitchen rewire at the Patels on Street Lane is about halfway done. Been there 6 hours today, still need another day at least. Used about 30 metres of 2.5mm twin and earth, 15 metres of 1.5mm for the lighting circuit. Got 8 double sockets in, need to do the cooker circuit and the lighting tomorrow. Materials so far probably £120 give or take. Full job was quoted at £1200 including cert. Mrs Patel keeps offering me samosas which is class. Need to pick up a 45 amp cooker switch from CEF in the morning and another consumer unit.`,
  },
];

export function processTranscript(transcript: string): ProcessedResult {
  // In production this would hit an AI API — for the demo we pattern-match
  const lower = transcript.toLowerCase();

  // Detect vibe
  let vibe: ExtractedData["vibe"] = "neutral";
  if (
    lower.includes("nightmare") ||
    lower.includes("absolute") ||
    lower.includes("bloody") ||
    lower.includes("freezing") ||
    lower.includes("knackered")
  ) {
    vibe = "stressed";
  } else if (
    lower.includes("lovely") ||
    lower.includes("happy") ||
    lower.includes("straightforward") ||
    lower.includes("nice") ||
    lower.includes("class")
  ) {
    vibe = "relaxed";
  }

  // Extract client
  const clientMatch = transcript.match(
    /(?:at\s+)?(?:Mrs?\.?\s+|Mr\.?\s+)?(\w+(?:'s)?)\s+(?:place\s+)?(?:in\s+|up\s+in\s+|on\s+)(\w[\w\s]*?)(?:,|\.|is|was)/i
  );
  const client_name = clientMatch
    ? clientMatch[1].replace(/'s$/, "")
    : "Not detected";
  const client_location = clientMatch ? clientMatch[2].trim() : "Not detected";

  // Extract financials
  const quoteMatch = lower.match(
    /(?:quoted?|charged?|£)\s*(?:at\s+|was\s+)?£?(\d+)/
  );
  const matCostMatch = lower.match(
    /(?:materials?|another|about)\s*(?:£|cost\s*)?£?(\d+)/
  );

  // Extract hours
  const hoursMatch = lower.match(/(\d+)\s*hours?/);

  // Extract materials (rough)
  const materials: { item: string; quantity: string }[] = [];
  const matPatterns = transcript.matchAll(
    /(\d+)\s+(rolls?|metres?|meters?|double sockets?|taps?)\s+(?:of\s+)?([^,.]+)/gi
  );
  for (const m of matPatterns) {
    materials.push({ item: `${m[2]} ${m[3]}`.trim(), quantity: m[1] });
  }
  if (materials.length === 0) {
    // fallback: grab any "item from Shop" patterns
    const shopMatch = transcript.match(/the\s+(.+?)\s+from\s+(\w+)/i);
    if (shopMatch) {
      materials.push({ item: shopMatch[1].trim(), quantity: "1" });
    }
  }

  // Action items
  const actions: string[] = [];
  const needPatterns = transcript.matchAll(
    /(?:need to|got to|gonna|told her I'd|should)\s+([^.]+)/gi
  );
  for (const m of needPatterns) {
    actions.push(m[1].trim().replace(/^\s*,\s*/, ""));
  }

  // Detect job type
  let job_type = "General Trade Work";
  if (lower.includes("felt") || lower.includes("roof") || lower.includes("flashing"))
    job_type = "Roofing";
  else if (lower.includes("basin") || lower.includes("tap") || lower.includes("plumb"))
    job_type = "Plumbing";
  else if (lower.includes("rewire") || lower.includes("socket") || lower.includes("circuit"))
    job_type = "Electrical";

  // Detect status
  let status: ExtractedData["status"] = "completed";
  if (lower.includes("halfway") || lower.includes("still need"))
    status = "in_progress";
  else if (lower.includes("come back") || lower.includes("follow up"))
    status = "follow_up_needed";

  const extracted: ExtractedData = {
    client_name:
      client_name === "Higgins"
        ? "Mrs. Higgins"
        : client_name === "Dave"
          ? "Dave"
          : client_name === "Patels"
            ? "The Patels"
            : client_name,
    client_location,
    job_type,
    materials,
    labor_hours: hoursMatch ? `${hoursMatch[1]} hours` : "Not specified",
    financials: {
      quoted: quoteMatch ? `£${quoteMatch[1]}` : "Not specified",
      materials_cost: matCostMatch ? `£${matCostMatch[1]}` : "Not specified",
      profit_margin: "Calculated on export",
    },
    action_items: actions.length > 0 ? actions : ["No actions detected"],
    status,
    vibe,
  };

  // Generate email draft based on vibe
  let email_draft: string;
  if (vibe === "stressed") {
    email_draft = `Subject: Update on Your ${job_type} Work — ${extracted.client_name}

Dear ${extracted.client_name},

Thank you for your patience today. I wanted to provide you with a clear update on the work completed at your property in ${extracted.client_location}.

During the job, we identified some additional work that was required beyond the original scope. I've noted the details below and will provide an updated breakdown at your earliest convenience.

I want to assure you that all work has been carried out to the highest standard, and I'm committed to ensuring you're completely satisfied with the result.

I'll be in touch shortly to arrange ${status === "follow_up_needed" ? "the follow-up visit we discussed" : "any next steps"}.

Kind regards,
[Your Name]
[Your Business]
[Phone Number]`;
  } else if (vibe === "relaxed") {
    email_draft = `Subject: All Done! — ${job_type} at ${extracted.client_location}

Hi ${extracted.client_name},

Just a quick note to say cheers for having me round today — great working with you!

Everything's fitted and working as it should. ${materials.length > 0 ? `All materials used were quality kit, so you should have no issues going forward.` : ""}

${status === "follow_up_needed" ? "I'll drop you a message in a couple of weeks about that other job we discussed — no rush at all." : "If you ever need anything else done, don't hesitate to give me a shout."}

All the best,
[Your Name]
[Your Business]
[Phone Number]`;
  } else {
    email_draft = `Subject: ${job_type} Work Update — ${extracted.client_location}

Dear ${extracted.client_name},

Thank you for today. Please find below a summary of the work carried out at your property.

${status === "in_progress" ? "The job is progressing well and I'll be returning to complete the remaining work as discussed." : "All work has been completed to standard."}

I'll follow up with a full breakdown shortly. Please don't hesitate to get in touch if you have any questions.

Best regards,
[Your Name]
[Your Business]
[Phone Number]`;
  }

  const json_output = JSON.stringify(
    {
      job_record: {
        id: `JOB-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        ...extracted,
      },
      integrations: {
        firebase_collection: "jobs",
        lemon_squeezy_invoice: extracted.financials.quoted !== "Not specified",
        notification_sent: false,
      },
    },
    null,
    2
  );

  return { extracted, email_draft, json_output };
}
