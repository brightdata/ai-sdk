import {
    amazon_product,
    chatgpt,
    facebook_profile,
    instagram_profile,
    linkedin_jobs,
    linkedin_profile,
    scrape,
    search,
} from '../dist/index.js';

// Smoke test for all exported tools using live Bright Data APIs.
// Usage: npm run smoke_test
// Optional: export BRIGHTDATA_API_KEY=...
// Optional env vars:
// BD_SCRAPE_URL BD_SCRAPE_COUNTRY BD_SEARCH_QUERY BD_SEARCH_ENGINE
// BD_SEARCH_COUNTRY BD_SEARCH_DATA_FORMAT BD_AMAZON_URL
// BD_AMAZON_ZIPCODE BD_LINKEDIN_URLS BD_LINKEDIN_PROFILE_FORMAT
// BD_LINKEDIN_JOBS_LOCATION BD_LINKEDIN_JOBS_KEYWORD
// BD_LINKEDIN_JOBS_COUNTRY BD_INSTAGRAM_URL BD_CHATGPT_PROMPT
// BD_CHATGPT_ADDITIONAL_PROMPT BD_CHATGPT_COUNTRY
// BD_CHATGPT_REQUIRE_SOURCES BD_CHATGPT_WEB_SEARCH BD_FACEBOOK_URL

const api_key = process.env.BRIGHTDATA_API_KEY;

const run_test = async test=>{
    const start_time = Date.now();
    const tool_instance = test.create_tool();
    const result = await tool_instance.execute(test.input, {
        toolCallId: 'smoke_test_'+test.name,
        messages: [],
    });
    const duration_ms = Date.now()-start_time;
    const has_error = typeof result=='string' && /^error\b/i.test(result);
    const preview = typeof result=='string'
        ? result.slice(0, 200)
        : JSON.stringify(result).slice(0, 200);
    return {
        name: test.name,
        ok: !has_error,
        duration_ms,
        preview,
    };
};

if (!api_key)
    console.log('BRIGHTDATA_API_KEY not exported, relying on .env support');

const tests = [{
    name: 'scrape',
    create_tool: ()=>scrape({api_key}),
    input: {
        url: process.env.BD_SCRAPE_URL || 'https://example.com',
        country: process.env.BD_SCRAPE_COUNTRY,
    },
}, {
    name: 'search',
    create_tool: ()=>search({api_key}),
    input: {
        query: process.env.BD_SEARCH_QUERY || 'Bright Data AI SDK',
        search_engine: process.env.BD_SEARCH_ENGINE || 'google',
        country: process.env.BD_SEARCH_COUNTRY,
        data_format: process.env.BD_SEARCH_DATA_FORMAT || 'markdown',
    },
}, {
    name: 'chatgpt',
    create_tool: ()=>chatgpt({api_key}),
    input: {
        prompt: process.env.BD_CHATGPT_PROMPT
            || 'What are current trends in AI safety?',
        additional_prompt: process.env.BD_CHATGPT_ADDITIONAL_PROMPT,
        country: process.env.BD_CHATGPT_COUNTRY,
        require_sources: process.env.BD_CHATGPT_REQUIRE_SOURCES=='true',
        web_search: process.env.BD_CHATGPT_WEB_SEARCH!='false',
    },
}, {
    name: 'amazon_product',
    create_tool: ()=>amazon_product({api_key}),
    input: {
        url: process.env.BD_AMAZON_URL
            || 'https://www.amazon.com/dp/B0D2Q9397Y',
        zipcode: process.env.BD_AMAZON_ZIPCODE,
    },
}, {
    name: 'linkedin_profile',
    create_tool: ()=>linkedin_profile({
        api_key,
        format: process.env.BD_LINKEDIN_PROFILE_FORMAT || 'json',
    }),
    input: {
        urls: (process.env.BD_LINKEDIN_URLS
            || 'https://www.linkedin.com/in/billgates/').split(','),
    },
}, {
    name: 'linkedin_jobs',
    create_tool: ()=>linkedin_jobs({api_key}),
    input: {
        location: process.env.BD_LINKEDIN_JOBS_LOCATION || 'New York, NY',
        keyword: process.env.BD_LINKEDIN_JOBS_KEYWORD || 'software engineer',
        country: process.env.BD_LINKEDIN_JOBS_COUNTRY || 'us',
    },
}, {
    name: 'instagram_profile',
    create_tool: ()=>instagram_profile({api_key}),
    input: {
        url: process.env.BD_INSTAGRAM_URL
            || 'https://www.instagram.com/instagram/',
    },
}, {
    name: 'facebook_profile',
    create_tool: ()=>facebook_profile({api_key}),
    input: {
        url: process.env.BD_FACEBOOK_URL
            || 'https://www.facebook.com/zuck/',
    },
}];

console.log('Running Bright Data AI SDK smoke test...');
console.log('Using tools from dist/index.js');
console.log('');

let failed = 0;
for (const test of tests)
{
    process.stdout.write('['+test.name+'] running... ');
    try {
        const test_result = await run_test(test);
        if (!test_result.ok)
            failed++;
        console.log(test_result.ok ? 'OK' : 'FAILED');
        console.log('  duration: '+test_result.duration_ms+'ms');
        console.log('  preview: '+test_result.preview);
    } catch(e){
        failed++;
        console.log('FAILED');
        console.log('  error: '+String(e));
    }
}

console.log('');
if (failed)
{
    console.log('Smoke test finished with '+failed+' failure(s).');
    process.exit(1);
}
console.log('Smoke test finished successfully.');
