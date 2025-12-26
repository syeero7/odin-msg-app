import {
  RegExpMatcher,
  TextCensor,
  asteriskCensorStrategy,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor();
censor.setStrategy(asteriskCensorStrategy());

export function filterProfane(text: string) {
  const matches = matcher.getAllMatches(text);
  return censor.applyTo(text, matches);
}

export function hasProfane(text: string) {
  return matcher.hasMatch(text);
}
