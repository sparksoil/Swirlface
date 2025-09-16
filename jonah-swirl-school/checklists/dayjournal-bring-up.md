Day Journal — Bring-Up Smoke Test

Run after any change to confirm nothing broke.
	1.	Open day.html in fresh browser profile.
	•	No console errors.
	•	Page loads within 2s.
	2.	Add crumb (“test crumb”).
	•	Appears instantly.
	•	Persists on reload.
	3.	Add comment (“test comment”).
	•	Appears under crumb.
	•	Persists on reload.
	4.	Delete crumb.
	•	Crumb + comment both gone.
	5.	Accessibility quick scan.
	•	Tab order moves logically.
	•	Focus rings visible.
	•	Screen reader announces new crumb/comment.

✅ Green-light = all five pass.
