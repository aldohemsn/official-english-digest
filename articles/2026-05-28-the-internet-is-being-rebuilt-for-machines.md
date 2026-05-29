---
id: 2026-05-28-the-internet-is-being-rebuilt-for-machines
title: The internet is being rebuilt for machines
source: techcrunch.com
url: 'https://techcrunch.com/2026/05/28/the-internet-is-being-rebuilt-for-machines/'
date: '2026-05-28'
topics:
  - technology
  - AI
type: full-text
---
Cloud infrastructure has long been designed around humans who search, click, scroll, and stream in a steady and predictable fashion. AI agents behave differently. They can unleash a swell of activity, spinning up multiple sub-agents that query hundreds of databases, search documents, and call APIs in seconds and then disappear as quickly as they arrived. 

Under that premise, Amazon is redesigning a core piece of its cloud infrastructure. On Thursday, AWS launched its next generation of OpenSearch Serverless, a fully managed search and vector database — essentially a system for storing and retrieving information at scale — that’s designed specifically for agentic workloads. AWS says the new system can instantly scale up when agents trigger tasks and scale back down to zero when idle.







The launch reflects a growing realization across the tech industry: Infrastructure originally designed for a human-driven internet doesn’t work as well in a world increasingly populated by agents.

While AI agents still represent a relatively small portion of internet activity, machine-generated traffic is already significant, and poised to grow. Cloudflare says bots accounted for 31% of overall HTTP traffic over the last six months. AI crawlers, search engines, and assistants made up roughly a quarter of all bot requests during that period. 

“Non-human traffic will exceed human traffic sometime in the first half of 2027,” said Lai Yi Ohlsen, senior product manager at Cloudflare, to TechCrunch.

At Google’s I/O developer conference last week, the company said users will be able to start delegating tasks to AI systems, like researching purchases, booking travel, browsing the web, and interacting with apps. But the buck doesn’t stop at consumer-focused AI agents. Enterprises are increasingly deploying agents internally and for their customers, creating new kinds of machine-generated traffic behind the scenes. 

As a result, cloud providers and infrastructure companies have been reckoning with how to adapt systems built for humans to a world of agents that are constantly and autonomously retrieving information, invoking tools, and generating machine-to-machine traffic. 


That’s where AWS’s new OpenSearch Serverless comes in. 

“The timing is straightforward. Agents are moving from experimentation into production, and they create traffic patterns that previous infrastructure simply wasn’t designed for,” Tia White, general manager for Amazon OpenSearch Service, told TechCrunch. “They spike without warning, they go idle without notice, and enterprise needs search that keeps up without paying for empty or idle compute.”

The key technical change with this new generation is that it decouples compute from storage, allowing compute to scale up in seconds to accommodate agent traffic bursts and to scale down to zero, so customers pay $0 when agents are idle.







“Previously, even in our prior Serverless version, you had to have at least one instance operational and running because storage and compute were coupled,” White said. “You couldn’t just automatically spin up [compute] at the rate you needed to, so you always had idle compute reserved for your workload, whether you were using it or not.”

Think of it like always paying for a parking space, even when you’re not using it. With AWS’s upgraded Serverless, it’s more like paying for a metered parking spot.

At launch, OpenSearch Serverless will integrate natively with AI development platforms like Vercel and Kiro, so developers can deploy production-ready search and vector backends for agents without managing infrastructure. 

The shift is emerging across the cloud industry. Databricks and Snowflake are repositioning themselves as AI memory and retrieval systems for enterprise data. Microsoft has rolled out updates to Azure designed to handle AI agent bursts and share memory between agents. Cloudflare, in a similar vein to Amazon, last month introduced infrastructure aimed at giving agents persistent environments and instant scalability. 

The more companies deploy AI agents, the more pressure there will be to redesign infrastructure around machine-generated workloads, which in turn could make agents cheaper and easier to deploy at larger scales.

 
When you purchase through links in our articles, we may earn a small commission. This doesn’t affect our editorial independence.
	
	
	
	

	

		Rebecca Bellan is a senior reporter at TechCrunch where she covers the business, policy, and emerging trends shaping artificial intelligence. Her work has also appeared in Forbes, Bloomberg, The Atlantic, The Daily Beast, and other publications. 
You can contact or verify outreach from Rebecca by emailing rebecca.bellan@techcrunch.com or via encrypted message at rebeccabellan.491 on Signal.	


	
	
		View Bio
