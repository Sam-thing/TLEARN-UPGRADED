// dns-fix.js
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

// Override DNS resolver to use Google DNS
const resolver = new dns.promises.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);
dns.promises.setServers(['8.8.8.8', '8.8.4.4']);