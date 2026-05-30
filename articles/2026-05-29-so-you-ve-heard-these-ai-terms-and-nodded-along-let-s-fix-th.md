---
id: 2026-05-29-so-you-ve-heard-these-ai-terms-and-nodded-along-le
title: So you’ve heard these AI terms and nodded along; let’s fix that
source: techcrunch.com
url: >-
  https://techcrunch.com/2026/05/29/artificial-intelligence-definition-glossary-hallucinations-guide-to-common-ai-terms/
date: '2026-05-29'
topics:
  - technology
  - AI
type: full-text
---
Artificial intelligence is changing the world, and simultaneously inventing a whole new language to describe how it’s doing it. Spend five minutes reading about AI and you’ll run into LLMs, RAG, RLHF, and a dozen other terms that can make even very smart people in the tech world feel insecure. This glossary is our attempt to fix that. We update it regularly as the field evolves, so consider it a living document, much like the AI systems it describes.



AGI

Artificial general intelligence, or AGI, is a nebulous term. But it generally refers to AI that’s more capable than the average human at many, if not most, tasks. OpenAI CEO Sam Altman once described AGI as the “equivalent of a median human that you could hire as a co-worker.” Meanwhile, OpenAI’s charter defines AGI as “highly autonomous systems that outperform humans at most economically valuable work.” Google DeepMind’s understanding differs slightly from these two definitions; the lab views AGI as “AI that’s at least as capable as humans at most cognitive tasks.” Confused? Not to worry — so are experts at the forefront of AI research.

AI agent

An AI agent refers to a tool that uses AI technologies to perform a series of tasks on your behalf — beyond what a more basic AI chatbot could do — such as filing expenses, booking tickets or a table at a restaurant, or even writing and maintaining code. However, as we’ve explained before, there are lots of moving pieces in this emergent space, so “AI agent” might mean different things to different people. Infrastructure is also still being built out to deliver on its envisaged capabilities. But the basic concept implies an autonomous system that may draw on multiple AI systems to carry out multistep tasks.

API endpoints

Think of API endpoints as “buttons” on the back of a piece of software that other programs can press to make it do things. Developers use these interfaces to build integrations — for example, allowing one application to pull data from another, or enabling an AI agent to control third-party services directly without a human manually operating each interface. Most smart home devices and connected platforms have these hidden buttons available, even if ordinary users never see or interact with them. As AI agents grow more capable, they are increasingly able to find and use these endpoints on their own, opening up powerful — and sometimes unexpected — possibilities for automation.

Chain of thought

Given a simple question, a human brain can answer without even thinking too much about it — things like “which animal is taller, a giraffe or a cat?” But in many cases, you often need a pen and paper to come up with the right answer because there are intermediary steps. For instance, if a farmer has chickens and cows, and together they have 40 heads and 120 legs, you might need to write down a simple equation to come up with the answer (20 chickens and 20 cows).







In an AI context, chain-of-thought reasoning for large language models means breaking down a problem into smaller, intermediate steps to improve the quality of the end result. It usually takes longer to get an answer, but the answer is more likely to be correct, especially in a logic or coding context. Reasoning models are developed from traditional large language models and optimized for chain-of-thought thinking thanks to reinforcement learning.

(See: Large language model)


Coding agents

This is a more specific concept that an “AI agent,” which means a program that can take actions on its own, step by step, to complete a goal. A coding agent is a specialized version applied to software development. Rather than simply suggesting code for a human to review and paste in, a coding agent can write, test, and debug code autonomously, handling the kind of iterative, trial-and-error work that typically consumes a developer’s day. These agents can operate across entire codebases, spotting bugs, running tests, and pushing fixes with minimal human oversight. Think of it like hiring a very fast intern who never sleeps and never loses focus — though, as with any intern, a human still needs to review the work.

Compute

Although somewhat of a multivalent term, compute generally refers to the vital computational power that allows AI models to operate. This type of processing fuels the AI industry, giving it the ability to train and deploy its powerful models. The term is often a shorthand for the kinds of hardware that provides the computational power — things like GPUs, CPUs, TPUs, and other forms of infrastructure that form the bedrock of the modern AI industry.

Deep learning

A subset of self-improving machine learning in which AI algorithms are designed with a multi-layered, artificial neural network (ANN) structure. This allows them to make more complex correlations compared to simpler machine learning-based systems, such as linear models or decision trees. The structure of deep learning algorithms draws inspiration from the interconnected pathways of neurons in the human brain.

Deep learning AI models are able to identify important characteristics in data themselves, rather than requiring human engineers to define these features. The structure also supports algorithms that can learn from errors and, through a process of repetition and adjustment, improve their own outputs. However, deep learning systems require a lot of data points to yield good results (millions or more). They also typically take longer to train compared to simpler machine learning algorithms — so development costs tend to be higher.

(See: Neural network)

Diffusion

Diffusion is the tech at the heart of many art-, music-, and text-generating AI models. Inspired by physics, diffusion systems slowly “destroy” the structure of data — for example, photos, songs, and so on — by adding noise until there’s nothing left. In physics, diffusion is spontaneous and irreversible — sugar diffused in coffee can’t be restored to cube form. But diffusion systems in AI aim to learn a sort of “reverse diffusion” process to restore the destroyed data, gaining the ability to recover the data from noise.

Distillation

Distillation is a technique used to extract knowledge from a large AI model with a ‘teacher-student’ model. Developers send requests to a teacher model and record the outputs. Answers are sometimes compared with a dataset to see how accurate they are. These outputs are then used to train the student model, which is trained to approximate the teacher’s behavior.







Distillation can be used to create a smaller, more efficient model based on a larger model with a minimal distillation loss. This is likely how OpenAI developed GPT-4 Turbo, a faster version of GPT-4.

While all AI companies use distillation internally, it may have also been used by some AI companies to catch up with frontier models. Distillation from a competitor usually violates the terms of service of AI API and chat assistants.

Fine-tuning

This refers to the further training of an AI model to optimize performance for a more specific task or area than was previously a focal point of its training — typically by feeding in new, specialized (i.e., task-oriented) data. 

Many AI startups are taking large language models as a starting point to build a commercial product but are vying to amp up utility for a target sector or task by supplementing earlier training cycles with fine-tuning based on their own domain-specific knowledge and expertise.

(See: Large language model [LLM])

GAN

A GAN, or Generative Adversarial Network, is a type of machine learning framework that underpins some important developments in generative AI when it comes to producing realistic data — including (but not only) deepfake tools. GANs involve the use of a pair of neural networks, one of which draws on its training data to generate an output that is passed to the other model to evaluate. 

The two models are essentially programmed to try to outdo each other. The generator is trying to get its output past the discriminator, while the discriminator is working to spot artificially generated data. This structured contest can optimize AI outputs to be more realistic without the need for additional human intervention. Though GANs work best for narrower applications (such as producing realistic photos or videos), rather than general purpose AI.

Hallucination

Hallucination is the AI industry’s preferred term for AI models making stuff up — literally generating information that is incorrect. Obviously, it’s a huge problem for AI quality. 







Hallucinations produce GenAI outputs that can be misleading and could even lead to real-life risks — with potentially dangerous consequences (think of a health query that returns harmful medical advice). 

The problem of AIs fabricating information is thought to arise as a consequence of gaps in training data. Hallucinations are contributing to a push toward increasingly specialized and/or vertical AI models — i.e. domain-specific AIs that require narrower expertise — as a way to reduce the likelihood of knowledge gaps and shrink disinformation risks.

Inference

Inference is the process of running an AI model. It’s setting a model loose to make predictions or draw conclusions from previously seen data. To be clear, inference can’t happen without training; a model must learn patterns in a set of data before it can effectively extrapolate from this training data.

Many types of hardware can perform inference, ranging from smartphone processors to beefy GPUs to custom-designed AI accelerators. But not all of them can run models equally well. Very large models would take ages to make predictions on, say, a laptop versus a cloud server with high-end AI chips.

[See: Training]

Large language model (LLM)

Large language models, or LLMs, are the AI models used by popular AI assistants, such as ChatGPT, Claude, Google’s Gemini, Meta’s AI Llama, Microsoft Copilot, or Mistral’s Le Chat. When you chat with an AI assistant, you interact with a large language model that processes your request directly or with the help of different available tools, such as web browsing or code interpreters.

LLMs are deep neural networks made of billions of numerical parameters (or weights, see below) that learn the relationships between words and phrases and create a representation of language, a sort of multidimensional map of words.

These models are created from encoding the patterns they find in billions of books, articles, and transcripts. When you prompt an LLM, the model generates the most likely pattern that fits the prompt. 







(See: Neural network)

Memory cache

Memory cache refers to an important process that boosts inference (which is the process by which AI works to generate a response to a user’s query). In essence, caching is an optimization technique, designed to make inference more efficient. AI is obviously driven by high-octane mathematical calculations and every time those calculations are made, they use up more power. Caching is designed to cut down on the number of calculations a model might have to run by saving particular calculations for future user queries and operations. There are different kinds of memory caching, although one of the more well-known is KV (or key value) caching. KV caching works in transformer-based models, and increases efficiency, driving faster results by reducing the amount of time (and algorithmic labor) it takes to generate answers to user questions.   

(See: Inference)  

Neural network

A neural network refers to the multi-layered algorithmic structure that underpins deep learning — and, more broadly, the whole boom in generative AI tools following the emergence of large language models. 

Although the idea of taking inspiration from the densely interconnected pathways of the human brain as a design structure for data processing algorithms dates all the way back to the 1940s, it was the much more recent rise of graphical processing hardware (GPUs) — via the video game industry — that really unlocked the power of this theory. These chips proved well suited to training algorithms with many more layers than was possible in earlier epochs — enabling neural network-based AI systems to achieve far better performance across many domains, including voice recognition, autonomous navigation, and drug discovery.

(See: Large language model [LLM])

Open source

Open source refers to software — or, increasingly, AI models — where the underlying code is made publicly available for anyone to use, inspect, or modify. In the AI world, Meta’s Llama family of models is a prominent example; Linux is the famous historical parallel in operating systems. Open source approaches allow researchers, developers, and companies around the world to build on top of one another’s work, accelerating progress and enabling independent safety audits that closed systems cannot easily provide. Closed source means the code is private — you can use the product but not see how it works, as is the case with OpenAI’s GPT models — a distinction that has become one of the defining debates in the AI industry.

Parallelization

Parallelization means doing many things at the same time instead of one after another — like having 10 employees working on different parts of a project at the same time instead of one employee doing everything sequentially. In AI, parallelization is fundamental to both training and inference: modern GPUs are specifically designed to perform thousands of calculations in parallel, which is a big reason why they became the hardware backbone of the industry. As AI systems grow more complex and models grow larger, the ability to parallelize work across many chips and many machines has become one of the most important factors in determining how quickly and cost-effectively models can be built and deployed. Research into better parallelization strategies is now a field of study in its own right.

RAMageddon

RAMageddon is the fun new term for a not-so-fun trend that is sweeping the tech industry: an ever-increasing shortage of random access memory, or RAM chips, which power pretty much all the tech products we use in our daily lives. As the AI industry has blossomed, the biggest tech companies and AI labs — all vying to have the most powerful and efficient AI — are buying so much RAM to power their data centers that there’s not much left for the rest of us. And that supply bottleneck means that what’s left is getting more and more expensive. 







That includes industries like gaming (where major companies have had to raise prices on consoles because it’s harder to find memory chips for their devices), consumer electronics (where memory shortage could cause the biggest dip in smartphone shipments in more than a decade), and general enterprise computing (because those companies can’t get enough RAM for their own data centers). The surge in prices is only expected to stop after the dreaded shortage ends but, unfortunately, there’s not really much of a sign that’s going to happen anytime soon.  

Recursive self-improvement

Like AGI, recursive self-improvement is a threshhold for how smart AI can get, and how little it may rely on humans. In the RSI scenario, AI models start improving themselves without human intervention, leading to a huge acceleration in capabilities and autonomy. In some tellings, this would be a cataclysmic moment akin to the singularity, a moment when AI models become immune to outside intervention. But RSI also describes a basic capability — can an AI model design its own successor? — which makes it much easier for engineers to try to build it. A number of recent AI startups have set out to build recursively self-improving models, but most of them dismiss the apocalyptic implications, presenting RSI as simply the next frontier for research.

Reinforcement learning

Reinforcement learning is a way of training AI where a system learns by trying things and receiving rewards for correct answers — like training your beloved pet with treats, except the “pet” in this scenario is a neural network and the “treat” is a mathematical signal indicating success. Unlike supervised learning, where a model is trained on a fixed dataset of labeled examples, reinforcement learning lets a model explore its environment, take actions, and continuously update its behavior based on the feedback it receives. This approach has proven especially powerful for training AI to play games, control robots, and, more recently, sharpen the reasoning ability of large language models. Techniques like reinforcement learning from human feedback, or RLHF, are now central to how leading AI labs fine-tune their models to be more helpful, accurate, and safe.

Token

When it comes to human-machine communication, there are some obvious challenges — people communicate using human language, while AI programs execute tasks through complex algorithmic processes informed by data. Tokens bridge that gap: they are the basic building blocks of human-AI communication, representing discrete segments of data that have been processed or produced by an LLM. They are created through a process called tokenization, which breaks down raw text into bite-sized units a language model can digest, similar to how a compiler translates human language into binary code a computer can understand. In enterprise settings, tokens also determine cost — most AI companies charge for LLM usage on a per-token basis, meaning the more a business uses, the more it pays.

Token throughput

So again, tokens are the small chunks of text — often parts of words rather than whole ones — that AI language models break language into before processing it; they are roughly analogous to “words” for the purposes of understanding AI workloads. Throughput refers to how much can be processed in a given period of time, so token throughput is essentially a measure of how much AI work a system can handle at once. High token throughput is a key goal for AI infrastructure teams, since it determines how many users a model can serve simultaneously and how quickly each of them receives a response. AI researcher Andrej Karpathy has described feeling anxious when his AI subscriptions sit idle — echoing the feeling he had as a grad student when expensive computer hardware wasn’t being fully utilized — a sentiment that captures why maximizing token throughput has become something of an obsession in the field.

Training

Developing machine learning AIs involves a process known as training. In simple terms, this refers to data being fed in in order that the model can learn from patterns and generate useful outputs. Essentially, it’s the process of the system responding to characteristics in the data that enables it to adapt outputs toward a sought-for goal — whether that’s identifying images of cats or producing a haiku on demand.

Training can be expensive because it requires lots of inputs, and the volumes required have been trending upwards — which is why hybrid approaches, such as fine-tuning a rules-based AI with targeted data, can help manage costs without starting entirely from scratch.

[See: Inference]

Transfer learning

A technique where a previously trained AI model is used as the starting point for developing a new model for a different but typically related task — allowing knowledge gained in previous training cycles to be reapplied. 







Transfer learning can drive efficiency savings by shortcutting model development. It can also be useful when data for the task that the model is being developed for is somewhat limited. But it’s important to note that the approach has limitations. Models that rely on transfer learning to gain generalized capabilities will likely require training on additional data in order to perform well in their domain of focus

(See: Fine tuning)

Validation loss

Validation loss is a number that tells you how well an AI model is learning during training — and lower is better. Researchers track it closely as a kind of real-time report card, using it to decide when to stop training, when to adjust hyperparameters, or whether to investigate a potential problem. One of the key concerns it helps flag is overfitting, a condition in which a model memorizes its training data rather than truly learning patterns it can generalize to new situations. Think of it as the difference between a student who genuinely understands the material and one who simply memorized last year’s exam — validation loss helps reveal which one your model is becoming.

Weights

Weights are core to AI training, as they determine how much importance (or weight) is given to different features (or input variables) in the data used for training the system — thereby shaping the AI model’s output. 

Put another way, weights are numerical parameters that define what’s most salient in a dataset for the given training task. They achieve their function by applying multiplication to inputs. Model training typically begins with weights that are randomly assigned, but as the process unfolds, the weights adjust as the model seeks to arrive at an output that more closely matches the target.

For example, an AI model for predicting housing prices that’s trained on historical real estate data for a target location could include weights for features such as the number of bedrooms and bathrooms, whether a property is detached or semi-detached, whether it has parking, a garage, and so on. 

Ultimately, the weights the model attaches to each of these inputs reflect how much they influence the value of a property, based on the given dataset.

This article is updated regularly with new information.
When you purchase through links in our articles, we may earn a small commission. This doesn’t affect our editorial independence.
