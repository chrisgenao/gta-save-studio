import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const section = script.slice(script.indexOf('function isNarrowScreen()'), script.indexOf('function switchView(next)'));
assert.ok(section.includes('function syncNavigationToggle()'));

function classList() {
  const classes = new Set();
  return {
    contains(name) { return classes.has(name); },
    remove(name) { classes.delete(name); },
    toggle(name) { if (classes.has(name)) { classes.delete(name); return false; } classes.add(name); return true; },
  };
}
function createControls(mobile) {
  const button = { attrs: {}, setAttribute(k,v) {this.attrs[k]=v;}, focus() {this.focused=true;} };
  const sidebar = { attrs: {}, setAttribute(k,v) {this.attrs[k]=v;}, inert:false };
  const app = { classList:classList() };
  const document = { body:{ classList:classList() } };
  const elements = {'#app':app,'#sidebar-toggle':button,'#primary-sidebar':sidebar};
  const context = {window:{matchMedia:()=>({matches:mobile})},document,$:(q)=>elements[q],icon:(name)=>name};
  runInNewContext(section,context);
  return {context,button,sidebar,app,document};
}

test('full-width desktop layout has a zero-width collapsed sidebar',()=>{
  assert.match(styles, /#app\.app-shell\s*\{[^}]*max-width:\s*none/);
  assert.match(styles, /#page-content\s*\{[^}]*max-width:\s*none/);
  assert.match(styles, /#app\.app-shell\.sidebar-collapsed\s*\{\s*grid-template-columns:\s*0 minmax\(0, 1fr\)/);
});

test('desktop navigation button hides sidebar and then restores it',()=>{
  const {context,button,sidebar,app}=createControls(false);
  context.syncNavigationToggle();
  assert.equal(button.attrs['aria-expanded'],'true');
  assert.equal(sidebar.inert,false);
  context.toggleNavigation();
  assert.equal(app.classList.contains('sidebar-collapsed'),true);
  assert.equal(button.attrs['aria-expanded'],'false');
  assert.equal(sidebar.inert,true);
  assert.equal(sidebar.attrs['aria-hidden'],'true');
  context.toggleNavigation();
  assert.equal(app.classList.contains('sidebar-collapsed'),false);
  assert.equal(button.attrs['aria-expanded'],'true');
  assert.equal(sidebar.inert,false);
});

test('mobile navigation opens and closes with accessible state',()=>{
  const {context,button,sidebar,document}=createControls(true);
  context.syncNavigationToggle();
  assert.equal(button.attrs['aria-expanded'],'false');
  assert.equal(sidebar.inert,true);
  context.toggleNavigation();
  assert.equal(document.body.classList.contains('menu-open'),true);
  assert.equal(button.attrs['aria-expanded'],'true');
  assert.equal(sidebar.inert,false);
  context.closeMobileNavigation();
  assert.equal(document.body.classList.contains('menu-open'),false);
  assert.equal(button.attrs['aria-expanded'],'false');
  assert.equal(sidebar.inert,true);
  assert.equal(button.focused,true);
});
