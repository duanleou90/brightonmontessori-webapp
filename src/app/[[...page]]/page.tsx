import { RenderBuilderContent } from '../components/builder-content';

interface PageProps {
  params: Promise<{
    page?: string[];
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

// Fetch content using the Builder Content API directly (server-side compatible)
async function fetchBuilderContent({
  model,
  urlPath,
  contentId,
  isPreview,
}: {
  model: string;
  urlPath?: string;
  contentId?: string;
  isPreview?: boolean;
}) {
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || '';
  
  if (!apiKey) {
    return null;
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = isPreview
    ? { cache: 'no-store' }
    : { next: { revalidate: 60 } };

  try {
    // When editing symbols (or previewing specific entries), Builder passes an entry/content id.
    // Symbols do not rely on URL targeting, so we must be able to fetch by id.
    if (contentId) {
      // Try direct-by-id endpoint (some Builder setups support this)
      const directResponse = await fetch(
        `https://cdn.builder.io/api/v3/content/${model}/${encodeURIComponent(contentId)}?apiKey=${apiKey}&cachebust=true`,
        fetchOptions
      );

      if (directResponse.ok) {
        const directData = await directResponse.json();
        // Some responses are { results: [...] }, others may return the entry directly
        return directData?.results?.[0] || directData || null;
      }

      // Fallback: query for id via list endpoint
      const queryResponse = await fetch(
        `https://cdn.builder.io/api/v3/content/${model}?apiKey=${apiKey}&query.id=${encodeURIComponent(contentId)}&cachebust=true`,
        fetchOptions
      );

      if (queryResponse.ok) {
        const queryData = await queryResponse.json();
        return queryData?.results?.[0] || null;
      }

      return null;
    }

    if (!urlPath) return null;

    const urlResponse = await fetch(
      `https://cdn.builder.io/api/v3/content/${model}?apiKey=${apiKey}&url=${encodeURIComponent(urlPath)}&cachebust=true`,
      fetchOptions
    );

    if (!urlResponse.ok) {
      return null;
    }

    const urlData = await urlResponse.json();
    return urlData?.results?.[0] || null;
  } catch (error) {
    console.error('[Builder.io] Error fetching content:', error);
    return null;
  }
}

type UmbracoDeliveryItem = {
  contentType?: string;
  name?: string;
  route?: { path?: string | null };
  properties?: Record<string, any>;
};

function normalizeUrlBase(url: string) {
  return url.replace(/\/+$/, '');
}

function getUmbracoOrigin() {
  const base =
    process.env.UMBRACO_SITE_BASE_URL ||
    process.env.NEXT_PUBLIC_UMBRACO_SITE_BASE_URL ||
    process.env.UMBRACO_DELIVERY_API_BASE_URL ||
    process.env.NEXT_PUBLIC_UMBRACO_DELIVERY_API_BASE_URL ||
    '';

  if (!base) return '';
  try {
    return new URL(base).origin;
  } catch {
    return '';
  }
}

function toAbsoluteUrl(url: string | undefined | null) {
  if (!url) return undefined;
  // Already absolute
  try {
    return new URL(url).toString();
  } catch {
    // Relative → resolve against Umbraco site origin (if configured/derivable)
    const origin = getUmbracoOrigin();
    if (!origin) return url;
    try {
      return new URL(url, origin).toString();
    } catch {
      return url;
    }
  }
}

function ensureLeadingSlash(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function ensureTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

async function fetchUmbracoDeliveryItemByPath(path: string, isPreview?: boolean): Promise<UmbracoDeliveryItem | null> {
  const base =
    process.env.UMBRACO_DELIVERY_API_BASE_URL ||
    process.env.NEXT_PUBLIC_UMBRACO_DELIVERY_API_BASE_URL ||
    '';

  if (!base) return null;

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = isPreview
    ? { cache: 'no-store' }
    : { next: { revalidate: 60 } };

  const normalizedPath = ensureTrailingSlash(ensureLeadingSlash(path));
  const url = `${normalizeUrlBase(base)}/content/item${normalizedPath}`;

  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) return null;
    return (await res.json()) as UmbracoDeliveryItem;
  } catch (error) {
    console.error('[Umbraco] Error fetching delivery item:', error);
    return null;
  }
}

function mapUmbracoEventToEventPageLayoutProps(item: UmbracoDeliveryItem | null) {
  const props = item?.properties || {};

  const firstEventImageUrl: string | undefined =
    Array.isArray(props.eventImage) && props.eventImage.length > 0 ? props.eventImage[0]?.url : undefined;

  return {
    image: toAbsoluteUrl(firstEventImageUrl),
    name: props.eventName ?? item?.name,
    publishedDate: props.publishedDate,
    address: props.venue,
    startTime: props.startDate,
    endTime: props.endDate,
    organizerName: props.organizerName,
    organizerPhone: props.organizerPhone,
    organizerWebsite: props.organizerWebsite,
  };
}

function injectEventDataIntoBuilderContent(content: any, umbracoItem: UmbracoDeliveryItem | null) {
  if (!content || !umbracoItem) return content;

  const eventProps = mapUmbracoEventToEventPageLayoutProps(umbracoItem);
  const cloned: any =
    typeof structuredClone === 'function' ? structuredClone(content) : JSON.parse(JSON.stringify(content));

  const visit = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node !== 'object') return;

    // Inject into the layout (and related event components, if present).
    const componentName = node?.component?.name;
    if (
      componentName === 'EventPageLayout' ||
      componentName === 'EventHeader' ||
      componentName === 'EventSidebar'
    ) {
      node.component.options = {
        ...(node.component.options || {}),
        ...eventProps,
      };
    }

    // Recurse through common Builder element trees and any nested options that contain blocks.
    for (const value of Object.values(node)) {
      visit(value);
    }
  };

  visit(cloned?.data?.blocks);
  return cloned;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const urlPath = '/' + (params?.page?.join('/') || '');
  
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || '';

  // If no API key is set, show setup message
  if (!apiKey) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Builder.io Setup Required</h1>
        <p>Please set your NEXT_PUBLIC_BUILDER_API_KEY environment variable.</p>
        <p>
          <a href="/preview" style={{ color: '#FD4D40', textDecoration: 'underline' }}>
            View Component Preview →
          </a>
        </p>
        <p style={{ marginTop: '20px' }}>
          <a href="https://builder.io/account/settings" target="_blank" rel="noopener noreferrer">
            Get your API key from Builder.io →
          </a>
        </p>
      </div>
    );
  }

  // Map URL paths to content models
  const modelMapping: { [key: string]: string } = {
    '/': 'home-page',
    '/about-us': 'about-us-page',
    // Add more mappings as needed
  };

  // Builder preview can pass an explicit model (e.g. model=symbol when editing a Symbol)
  const explicitModel = firstString(searchParams.model);

  // Determine which model to use based on the URL path
  // Check if it's an event page (starts with /events/)
  let model: string;
  if (explicitModel) {
    model = explicitModel;
  } else if (urlPath.startsWith('/events/') || urlPath === '/events') {
    model = 'event-page';
  } else {
    model = modelMapping[urlPath] || 'home-page';
  }

  const isEventDetailPage =
    urlPath.startsWith('/events/') &&
    urlPath !== '/events/event-template' &&
    urlPath !== '/events';

  // For event detail pages, we render the Builder "Event Template" entry,
  // then inject the Umbraco event data into the Builder-rendered UI.
  const builderUrlPath = isEventDetailPage ? '/events/event-template' : urlPath;

  // When Builder is editing, it can provide an entry/content id rather than relying on URL targeting
  const contentId =
    firstString(searchParams.entry) ||
    firstString(searchParams.contentId) ||
    firstString(searchParams['builder.contentId']) ||
    firstString(searchParams['builder.entry']);

  const isPreview = Boolean(firstString(searchParams['builder.preview'])) || Boolean(firstString(searchParams.preview));

  // Fetch content server-side using Content API
  const content = await fetchBuilderContent({ model, urlPath: builderUrlPath, contentId, isPreview });

  // If this is an Umbraco-backed event detail page, fetch event JSON by path and inject into Builder content
  let umbracoItem: UmbracoDeliveryItem | null = null;
  let hydratedContent = content;
  let builderData: any = undefined;

  if (isEventDetailPage) {
    // Derive the Umbraco route from the request path, e.g. /events/<slug>/
    const eventPath = ensureTrailingSlash(urlPath);
    umbracoItem = await fetchUmbracoDeliveryItemByPath(eventPath, isPreview);

    // Provide both raw Umbraco item and mapped fields to Builder data bindings (optional)
    const mapped = mapUmbracoEventToEventPageLayoutProps(umbracoItem);
    builderData = {
      urlPath,
      umbraco: umbracoItem,
      event: mapped,
    };

    // Inject mapped event fields into the Builder component props (works even without bindings set up in Builder)
    hydratedContent = injectEventDataIntoBuilderContent(content, umbracoItem);
  }

  // Log for debugging
  if (!content && process.env.NODE_ENV === 'development') {
    console.log(`[Builder.io Debug] No content found for:`, {
      model,
      urlPath,
      contentId,
      isPreview,
      apiKey: apiKey ? '✓ Set' : '✗ Missing',
    });
  }

  return (
    <>
      <RenderBuilderContent content={hydratedContent} model={model} data={builderData} />
    </>
  );
}
