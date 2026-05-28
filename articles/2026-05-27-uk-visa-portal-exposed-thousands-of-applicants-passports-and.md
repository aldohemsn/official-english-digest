---
id: 2026-05-27-uk-visa-portal-exposed-thousands-of-applicants-pas
title: >-
  UK Visa Portal exposed thousands of applicants’ passports and selfies — then
  called the lawyers on us
source: techcrunch.com
url: >-
  https://techcrunch.com/2026/05/27/uk-visa-portal-spilled-thousands-of-applicants-passports-and-selfies-online-and-hasnt-fixed-the-leak/
date: '2026-05-27'
topics:
  - technology
  - AI
type: full-text
---
A website called UK Visa Portal publicly exposed thousands of passports and selfie photos of applicants who paid the site to obtain a U.K. immigration visa, TechCrunch has learned.

An anonymous person notified TechCrunch about the security lapse, saying that the website was exposing at least 100,000 documents from people who uploaded their passports and selfies to the website as part of the application process.







The website is not affiliated with the U.K. government, and some have complained that they mistakenly paid a fee to this company instead of using the official GOV.UK website.

The exposed data was secured overnight into Wednesday, hours after we published our initial story about the incident. Given the highly sensitive nature of the exposed data, TechCrunch revealed that there was an ongoing security issue, while withholding specific details to minimize any additional risk to individuals’ private information.

TechCrunch has still not heard back from UK Visa Portal’s management. Rather than fixing the issue when we reached out, the company sent its attorneys and public relations firm our way instead.

The security lapse is the latest example of companies publicly exposing their customers’ sensitive government-issued identity documents in recent weeks, often caused by a misconfiguration rather than an outside cyberattack. The exposure of passports is especially problematic at a time when online identity checks are on the rise around the world, thanks to governments rolling out age-verification laws.

The company’s lack of response also leaves open questions about whether it will alert affected customers that their passports were publicly exposed, or notify regulators as required under U.S. state and European data breach notification laws.

Exposed passports, selfies, and location data

The data spill stemmed from a public Amazon-hosted storage server (also known as a bucket), which UK Visa Portal uses for hosting user-uploaded passports and selfies.

While the bucket was not publicly listing its contents, the files within were still accessible and viewable to anyone who knew the web address of each file. The person who notified us about the exposure said a bug on the UK Visa Portal website’s back end allowed them to view the list of files contained in the bucket.

TechCrunch confirmed that UK Visa Portal (also known as UK Visit and ETA-Pass) was the source of the data leak and verified the authenticity of the exposed data by contacting affected individuals to ask if their information was accurate.







Many of the user-uploaded photos also contained the precise real-world location, revealing where the images were taken; in some cases, this location data was accurate enough to expose the image taker’s home address.

UK Visa Portal does not provide a way to report security issues through its website, nor does its website provide names or contact information for the company’s management. TechCrunch sent an email to the email address listed on UK Visa Portal’s website, alerting them that the company had an ongoing security lapse and asking with whom in management we could share details to resolve the issue. TechCrunch explained that we could not share specifics with the company’s general customer support inbox because we could not guarantee that the exposed data would not be misused.

The customer support person provided TechCrunch with the name and email address of Michael Taylor, who we were told is a manager at UK Visa Portal. The person did not reply to our inquiry.

Soon after, attorneys with U.S. law firm BakerHostetler and representatives with public relations firm FTI Consulting contacted TechCrunch seeking information about the issue at UK Visa Portal. When asked by TechCrunch, the attorneys would not provide evidence that they were authorized to speak on behalf of the company, such as by providing us a public record confirming the name and role of the individuals they claim to represent. We noted again that we could not share information about the security lapse outside of the company’s management. 

We added that if Taylor, or another manager, is willing to accept information about the security lapse, they can reach out — or the attorneys can copy them on the email thread. We did not hear back.

After our story was published and the bucket secured, TechCrunch presented the attorneys with a series of questions about the security lapse. The questions we asked BakerHostetler partner Ryan Christian included how long the Amazon-hosted bucket was exposed, the reason it was exposed, and if the company had any logs to determine if anyone accessed or downloaded the exposed data. We also asked who at UK Visa Portal is responsible for cybersecurity, if anyone. Christian did not respond. 

UK Visa Portal is allegedly run by a company called Active Leadgen LLC, which purports to be a company based in the United Arab Emirates. TechCrunch could not independently corroborate this.

It is not necessary to use a third-party service to apply for a U.K. electronic travel authorization, unless you are retaining an immigration attorney, and applicants should apply through the U.K. government’s website.







First published on May 26 and updated with additional information about the security lapse.
When you purchase through links in our articles, we may earn a small commission. This doesn’t affect our editorial independence.
