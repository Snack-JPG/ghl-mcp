# New Tools — From GHL Scope List

## High Value (would win Upwork jobs)

### Invoices & Payments
- `list_invoices` — View invoices (invoices.readonly)
- `create_invoice` — Create invoice (invoices.write)
- `list_transactions` — View payment transactions (payments/transactions.readonly)
- `list_orders` — View payment orders (payments/orders.readonly)
- `list_subscriptions` — View subscriptions (payments/subscriptions.readonly)
→ **Why:** Every GHL agency does billing. "Your AI can generate invoices" is a killer pitch.

### Social Media Planner
- `list_social_posts` — View scheduled posts (socialplanner/post.readonly)
- `create_social_post` — Schedule a post (socialplanner/post.write)
- `list_social_accounts` — View connected accounts (socialplanner/account.readonly)
- `get_social_stats` — View statistics (socialplanner/statistics.readonly)
→ **Why:** Agencies manage social for clients. AI scheduling = massive time saver.

### Forms & Funnels
- `list_forms` — View forms (forms.readonly)
- `list_funnels` — View funnels (funnels/funnel.readonly)
- `list_funnel_pages` — View pages (funnels/page.readonly)
→ **Why:** Agencies build funnels in GHL. Being able to query form submissions + funnel stats via AI is huge.

### Tasks
- `list_tasks` — View tasks (locations/tasks.readonly)
- `create_task` — Create task (locations/tasks.write)
→ **Why:** CRM + task management together. "Remind me to call John tomorrow" creates a task.

### Products
- `list_products` — View products (products.readonly)
- `list_product_prices` — View prices (products/prices.readonly)
→ **Why:** E-commerce agencies on GHL.

## Medium Value

### Email Builder
- `list_email_templates` — View templates (emails/builder.readonly)
- `list_email_schedules` — View scheduled emails (emails/schedule.readonly)

### Campaigns
- `list_campaigns` — View campaigns (campaigns.readonly)

### Documents & Contracts
- `list_contracts` — View contracts (documents_contracts/list.readonly)
- `send_contract_link` — Send contract for signing (documents_contracts/sendLink.write)

### Knowledge Base (meta!)
- `list_knowledge_bases` — View KBs (knowledge-bases.readonly)
- `edit_knowledge_base` — Update KB (knowledge-bases.write)

### Voice AI
- `list_voice_agents` — View voice AI agents (voice-ai-agents.readonly)
- `create_voice_agent` — Create voice agent (voice-ai-agents.write)

## Lower Priority (but differentiating)
- Blog management (blogs/post.write, blogs/posts.readonly)
- Courses (courses.readonly, courses.write)
- Custom fields/values management
- Associations management
- Brand boards
