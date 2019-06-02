Yet another phishing scam, and one that bares many similarities to https://github.com/Silic0nS0ldier/phishing-scam-capture-20180816

Like last time, I managed to extract client sources via source mapping though not without a surprise. Last time the devtools abort detection failed to work, this time it went off without a hitch redirecting the page to `about:blank`.

Based on dates observed from its API calls, this appears to be an evolution of the last attack. Had certain elements correctly loaded (like the UOW logo which I guess has since applied changes to block usage on other sites), this likely would have looked almost identical to the last iteration. There is a high probability that either this is the same group behind the attack or its another group with the same data and source (have modified it).

Also like last time, snooping around has proven to be enough to trigger a defense mechanism (redirecting to a website that resembles CNN, or another well known site), clearly filled with scam links and content).

With the protections working this time around, I wasn't able to grab all the source (at least not without applying more effort than I care to). Either way, the meat is in `App.jsx` anyway (technically just `js` in the attackers source, but using JSX syntax with a normal JS file extension triggers a wave of OCD so here we are).

No telltale signs of who might be responsible this time, but its still interesting to see the evolution.

## The Email

The email like last time is very light on content, aiming to piq the victims curiosity so that they click through to the link. It roughly looks like;

--------------------------
...

[Message clipped] View entire message

--------------------------

Link wise, its like these;

* `http://online.onlineeba.host/pentad/wreathlet.php?transcursively=championess&32456694=8361585e-2f97-4e90-83f3-dd0a064fcd40`
* `http://secure-client.onlineeba.host/byrne/lappilli.asp?cylindrometric=scholarlike&44890848=8121da61-0d39-4e6e-abe6-c728d2ae12f1`

The amount of variation (likely to get past spam filters) is interesting.

## The API

As mentioned earlier, I managed to snap up an API response, take a look at `api-res.json` for a sample (annonymised for my sake).
