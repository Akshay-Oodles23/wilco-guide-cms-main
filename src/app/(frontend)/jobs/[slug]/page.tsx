// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import { Metadata } from "next";
import "@/styles/job-detail.css";
import { JobActionButtons } from "./JobActionButtons";
import { ApplyButton } from "./ApplyButton";
import { NewsletterSubscribeButton } from "./NewsletterSubscribeButton";

// Generate metadata for the job detail page
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	try {
		const payload = await getPayload({ config });
		const jobData = await payload.findByID({
			collection: "jobs",
			id: slug,
			depth: 2,
		});

		if (!jobData) {
			return {
				title: "Job Not Found | WilCo Guide",
				description: "The job you are looking for could not be found.",
			};
		}

		return {
			title: `${jobData.title} — ${jobData.company?.name || "WilCo"} | WilCo Guide Jobs`,
			description:
				jobData.description?.substring(0, 160) ||
				`Apply for ${jobData.title} at ${jobData.company?.name}. Find jobs in Williamson County.`,
		};
	} catch (error) {
		return {
			title: "Job Listing | WilCo Guide",
			description: "Browse job listings in Williamson County.",
		};
	}
}

// Helper functions for formatting
function formatSalary(minSalary?: number, maxSalary?: number): string {
	if (!minSalary && !maxSalary) return "Competitive salary";

	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});

	if (minSalary && maxSalary) {
		return `${formatter.format(minSalary)} – ${formatter.format(maxSalary)} per year`;
	}

	if (minSalary) return `${formatter.format(minSalary)}+ per year`;
	if (maxSalary) return `Up to ${formatter.format(maxSalary)} per year`;

	return "Competitive salary";
}

function formatJobType(jobType?: string): string {
	const typeMap: Record<string, string> = {
		full_time: "Full-time",
		part_time: "Part-time",
		contract: "Contract",
		temporary: "Temporary",
		internship: "Internship",
	};
	return typeMap[jobType || ""] || "Full-time";
}

function getJobTypeTag(jobType?: string): string {
	const type = jobType?.toLowerCase() || "full-time";
	const tagMap: Record<string, string> = {
		full_time: "jtag-ft",
		part_time: "jtag-bn",
		contract: "jtag-ur",
		temporary: "jtag-on",
		internship: "jtag-ft",
	};
	return tagMap[type] || "jtag-ft";
}

function formatDate(date?: string | Date): string {
	if (!date) return "Recently posted";
	const postDate = new Date(date);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - postDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Posted today";
	if (diffDays === 1) return "Posted yesterday";
	if (diffDays < 7) return `Posted ${diffDays} days ago`;
	if (diffDays < 30) return `Posted ${Math.ceil(diffDays / 7)} weeks ago`;
	return `Posted ${Math.ceil(diffDays / 30)} months ago`;
}

function formatLocation(location: any): string {
	if (!location) return "";
	if (typeof location === "string") return location;
	if (typeof location === "object") {
		const parts = [];
		if (location.city) parts.push(location.city);
		if (location.state) parts.push(location.state);
		if (parts.length > 0) return parts.join(", ");
	}
	return "";
}

function extractLexicalText(data: any): string {
	if (!data) return "";
	if (typeof data === "string") return data;

	let text = "";

	// Extract text from Lexical JSON structure
	const traverse = (node: any) => {
		if (!node) return;

		// If it's a text node with text property
		if (node.text && typeof node.text === "string") {
			text += node.text;
		}

		// If it has children array, recursively traverse
		if (node.children && Array.isArray(node.children)) {
			node.children.forEach(traverse);
		}
	};

	// Start from root if it exists
	if (data.root) {
		traverse(data.root);
	} else {
		traverse(data);
	}

	return text;
}

export default async function JobDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const payload = await getPayload({ config });

	let job: any = null;
	let relatedJobs: any[] = [];

	try {
		// Fetch the job by ID (slug param is the job id)
		job = await payload.findByID({
			collection: "jobs",
			id: slug,
			depth: 2,
		});

		// Fetch related jobs for sidebar
		if (job?.company?.id) {
			try {
				const relatedResult = await payload.find({
					collection: "jobs",
					where: {
						and: [
							{
								company: {
									equals: job.company.id,
								},
							},
							{
								id: {
									not_equals: job.id,
								},
							},
						],
					},
					limit: 4,
					depth: 1,
				});
				relatedJobs = relatedResult.docs;
			} catch (err) {
				console.error("Error fetching related jobs:", err);
			}
		}
	} catch (error) {
		console.error("Error fetching job:", error);
	}

	if (!job) {
		return (
			<div style={{ padding: "40px", textAlign: "center" }}>
				<h1>Job Not Found</h1>
				<p>The job listing you are looking for does not exist.</p>
				<Link href='/jobs'>Back to Jobs</Link>
			</div>
		);
	}

	const company = job.company || {};
	const jobType = formatJobType(job.jobType);
	const jobTypeTag = getJobTypeTag(job.jobType);
	const salary = formatSalary(job.minSalary, job.maxSalary);
	const postDate = formatDate(job.createdAt);

	return (
		<>
			{/* BREADCRUMB */}
			<div className='breadcrumb'>
				<Link href='/jobs'>Jobs</Link>
				<span className='breadcrumb-sep'>›</span>
				{job.industry && (
					<>
						<Link href={`/jobs?industry=${job.industry}`}>
							{job.industry}
						</Link>
						<span className='breadcrumb-sep'>›</span>
					</>
				)}
				<span>{job.title}</span>
			</div>

			<div className='job-page'>
				<div className='job-layout'>
					{/* ═══════════════════ LEFT: JOB CONTENT ═══════════════════ */}
					<div>
						{/* HEADER */}
						<div className='job-header'>
							<div className='job-header-top'>
								<div className='job-header-logo'>
									{company?.logo &&
									typeof company.logo === "object" &&
									"url" in company.logo ? (
										<img
											src={company.logo.url}
											alt={company.name || "Company logo"}
										/>
									) : (
										<img
											src='https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80'
											alt='Company logo'
										/>
									)}
								</div>
								<div className='job-header-info'>
									<div className='job-header-company'>
										{company?.id ? (
											<Link
												href={`/companies/${company.slug}`}
											>
												{company.name}
											</Link>
										) : (
											company.name || "Company"
										)}
										{formatLocation(job.location) &&
											` · ${formatLocation(job.location)}`}
									</div>
									<h1 className='job-header-title'>
										{job.title}
									</h1>
									<div className='job-header-tags'>
										<span className={`jtag ${jobTypeTag}`}>
											{jobType}
										</span>
										{job.benefits &&
											job.benefits.length > 0 && (
												<span className='jtag jtag-bn'>
													Full Benefits
												</span>
											)}
										{job.urgent && (
											<span className='jtag jtag-ur'>
												Urgent Hire
											</span>
										)}
										{job.workMode && (
											<span className='jtag jtag-on'>
												{job.workMode}
											</span>
										)}
									</div>
									<div className='job-header-meta'>
										{formatLocation(job.location) && (
											<span className='job-meta-item'>
												📍{" "}
												{formatLocation(job.location)}
											</span>
										)}
										{job.industry && (
											<span className='job-meta-item'>
												🏥 {job.industry}
											</span>
										)}
										<span className='job-meta-item'>
											📅 {postDate}
										</span>
										{job.applicantCount && (
											<span className='job-meta-item'>
												👥 {job.applicantCount}{" "}
												applicants
											</span>
										)}
									</div>
								</div>
							</div>
							<JobActionButtons
								applicationUrl={job.applicationUrl}
							/>
						</div>

						{/* SALARY */}
						{job.minSalary || job.maxSalary ? (
							<div className='salary-banner'>
								<div>
									<div className='salary-banner-amount'>
										{salary}
									</div>
									{job.salaryNote && (
										<div className='salary-banner-detail'>
											{job.salaryNote}
										</div>
									)}
								</div>
							</div>
						) : null}

						{/* QUICK FACTS */}
						<div className='quick-facts'>
							<div className='quick-fact'>
								<div className='quick-fact-label'>
									Experience
								</div>
								<div className='quick-fact-value'>
									{job.experienceLevel || "2+ years"}
								</div>
							</div>
							<div className='quick-fact'>
								<div className='quick-fact-label'>Schedule</div>
								<div className='quick-fact-value'>
									{job.schedule || "36 hours/week"}
								</div>
							</div>
							<div className='quick-fact'>
								<div className='quick-fact-label'>
									Start Date
								</div>
								<div className='quick-fact-value'>
									{job.startDate || "Immediate"}
								</div>
							</div>
						</div>

						{/* ABOUT THE ROLE */}
						<div className='job-section'>
							<h2 className='job-section-title'>
								About the Role
							</h2>
							{job.description ? (
								<div
									dangerouslySetInnerHTML={{
										__html: extractLexicalText(
											job.description,
										).replace(/\n/g, "<br/>"),
									}}
								/>
							) : (
								<p>
									This is an exciting opportunity to join our
									team. We are looking for a talented
									professional to contribute to our growing
									organization. If you meet the requirements
									and are interested in this position, please
									apply now.
								</p>
							)}
						</div>

						{/* RESPONSIBILITIES */}
						{job.responsibilities &&
						job.responsibilities.length > 0 ? (
							<div className='job-section'>
								<h2 className='job-section-title'>
									Responsibilities
								</h2>
								<ul>
									{Array.isArray(job.responsibilities) ? (
										job.responsibilities.map(
											(resp: string, idx: number) => (
												<li key={idx}>{resp}</li>
											),
										)
									) : (
										<li>{job.responsibilities}</li>
									)}
								</ul>
							</div>
						) : null}

						{/* REQUIREMENTS */}
						{job.requirements && job.requirements.length > 0 ? (
							<div className='job-section'>
								<h2 className='job-section-title'>
									Requirements
								</h2>
								<ul>
									{Array.isArray(job.requirements) ? (
										job.requirements.map(
											(req: string, idx: number) => (
												<li key={idx}>{req}</li>
											),
										)
									) : (
										<li>{job.requirements}</li>
									)}
								</ul>
							</div>
						) : null}

						{/* BENEFITS */}
						{job.benefits && job.benefits.length > 0 ? (
							<div className='job-section'>
								<h2 className='job-section-title'>Benefits</h2>
								<div className='benefits-grid'>
									{Array.isArray(job.benefits)
										? job.benefits.map(
												(benefit: any, idx: number) => (
													<div
														key={idx}
														className='benefit-item'
													>
														<span className='benefit-icon'>
															{benefit.icon ||
																"✓"}
														</span>
														<span className='benefit-text'>
															{typeof benefit ===
															"string"
																? benefit
																: benefit.name ||
																	benefit}
														</span>
													</div>
												),
											)
										: null}
								</div>
							</div>
						) : null}

						{/* ABOUT THE COMPANY */}
						{company?.description ? (
							<div className='job-section'>
								<h2 className='job-section-title'>
									About the Company
								</h2>
								<p>{company.description}</p>
							</div>
						) : null}

						{/* BOTTOM APPLY */}
						<div className='bottom-apply'>
							<div>
								<div className='bottom-apply-text'>
									Ready to apply?
								</div>
								<div className='bottom-apply-sub'>
									{job.applicantCount &&
									job.applicantCount > 0
										? `${job.applicantCount} people have applied in the last 2 days`
										: "Start your application today"}
								</div>
							</div>
							<ApplyButton applicationUrl={job.applicationUrl} />
						</div>

						{/* MORE JOBS AT THIS COMPANY */}
						{relatedJobs.length > 0 && (
							<div className='more-at-company'>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: "14px",
									}}
								>
									<h2
										style={{
											fontFamily: "'Fraunces', serif",
											fontWeight: 700,
											fontSize: "20px",
										}}
									>
										More at {company.name || "This Company"}
									</h2>
									<span
										style={{
											fontSize: "12px",
											fontWeight: 600,
											color: "var(--text-muted)",
											background: "var(--bg)",
											padding: "4px 12px",
											borderRadius: "6px",
										}}
									>
										{relatedJobs.length} open jobs
									</span>
								</div>
								<div className='more-at-company-grid'>
									{relatedJobs.map((relatedJob: any) => (
										<Link
											key={relatedJob.id}
											href={`/jobs/${relatedJob.id}`}
											style={{
												textDecoration: "none",
												color: "inherit",
											}}
										>
											<div className='mac-card'>
												<div className='mac-title'>
													{relatedJob.title}
												</div>
												<div className='mac-meta'>
													📍{" "}
													{formatLocation(
														relatedJob.location,
													) || "Location TBA"}{" "}
													·{" "}
													{formatJobType(
														relatedJob.jobType,
													)}
												</div>
												<div className='mac-bottom'>
													<span className='mac-salary'>
														{formatSalary(
															relatedJob.minSalary,
															relatedJob.maxSalary,
														)}
													</span>
													<button className='mac-apply'>
														View
													</button>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>

					{/* ═══════════════════ RIGHT: SIDEBAR ═══════════════════ */}
					<div className='sidebar'>
						{/* COMPANY CARD */}
						{company?.id ? (
							<div className='sidebar-widget'>
								<div className='company-card-header'>
									<div className='company-card-logo'>
										{company?.logo &&
										typeof company.logo === "object" &&
										"url" in company.logo ? (
											<img
												src={company.logo.url}
												alt={
													company.name ||
													"Company logo"
												}
											/>
										) : (
											<img
												src='https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80'
												alt='Company logo'
											/>
										)}
									</div>
									<div>
										<div className='company-card-name'>
											{company.name}
										</div>
										<div className='company-card-industry'>
											{company.industry &&
												`${company.industry} · `}
											{company.headquarters ||
												"Williamson County, TX"}
										</div>
									</div>
								</div>
								{company.description && (
									<p className='company-card-desc'>
										{company.description}
									</p>
								)}
								{company.openJobsCount ||
								company.employeeCount ? (
									<div className='company-card-stats'>
										{company.openJobsCount && (
											<div className='company-stat'>
												<div className='company-stat-num'>
													{company.openJobsCount}
												</div>
												<div className='company-stat-label'>
													Open Jobs
												</div>
											</div>
										)}
										{company.employeeCount && (
											<div className='company-stat'>
												<div className='company-stat-num'>
													{company.employeeCount}
												</div>
												<div className='company-stat-label'>
													Employees
												</div>
											</div>
										)}
									</div>
								) : null}
								<div className='company-card-links'>
									<Link
										href={`/companies/${company.slug}`}
										className='company-card-link'
									>
										View all jobs at {company.name}
										<span className='company-card-link-arrow'>
											→
										</span>
									</Link>
									{company.website && (
										<a
											href={company.website}
											target='_blank'
											rel='noopener noreferrer'
											className='company-card-link'
										>
											View Business Page
											<span className='company-card-link-arrow'>
												→
											</span>
										</a>
									)}
								</div>
							</div>
						) : null}

						{/* SIMILAR JOBS */}
						{relatedJobs.length > 0 ? (
							<div className='sidebar-widget'>
								<div className='sidebar-widget-title'>
									Similar Jobs
								</div>
								{relatedJobs
									.slice(0, 4)
									.map((relatedJob: any) => (
										<Link
											key={relatedJob.id}
											href={`/jobs/${relatedJob.id}`}
											style={{
												textDecoration: "none",
												color: "inherit",
											}}
										>
											<div className='similar-job'>
												<div className='similar-job-title'>
													{relatedJob.title}
												</div>
												<div className='similar-job-company'>
													{relatedJob.company?.name ||
														"Company"}
												</div>
												<div className='similar-job-bottom'>
													<span className='similar-job-salary'>
														{relatedJob.minSalary &&
														relatedJob.maxSalary
															? `$${Math.floor(relatedJob.minSalary / 1000)}K – $${Math.floor(relatedJob.maxSalary / 1000)}K`
															: "Competitive"}
													</span>
													<span className='similar-job-location'>
														📍{" "}
														{formatLocation(
															relatedJob.location,
														) || "Location TBA"}
													</span>
												</div>
											</div>
										</Link>
									))}
							</div>
						) : null}

						{/* FEATURED COMPANIES (dark) */}
						<div className='sidebar-widget-dark'>
							<div className='sidebar-widget-title'>
								Featured Companies
								<span className='sidebar-sponsored'>
									Sponsored
								</span>
							</div>
							<div className='sidebar-dark-company'>
								<div className='sidebar-dark-co-logo'>BS</div>
								<div>
									<div className='sidebar-dark-co-name'>
										Baylor Scott & White
									</div>
									<div className='sidebar-dark-co-count'>
										18 open jobs
									</div>
								</div>
							</div>
							<div className='sidebar-dark-company'>
								<div className='sidebar-dark-co-logo'>HB</div>
								<div>
									<div className='sidebar-dark-co-name'>
										H-E-B
									</div>
									<div className='sidebar-dark-co-count'>
										12 open jobs
									</div>
								</div>
							</div>
							<div className='sidebar-dark-company'>
								<div className='sidebar-dark-co-logo'>LI</div>
								<div>
									<div className='sidebar-dark-co-name'>
										Leander ISD
									</div>
									<div className='sidebar-dark-co-count'>
										24 open jobs
									</div>
								</div>
							</div>
							<div className='sidebar-dark-company'>
								<div className='sidebar-dark-co-logo'>KR</div>
								<div>
									<div className='sidebar-dark-co-name'>
										Kalahari Resorts
									</div>
									<div className='sidebar-dark-co-count'>
										8 open jobs
									</div>
								</div>
							</div>
						</div>

						{/* NEWSLETTER */}
						<div className='sidebar-widget sidebar-newsletter'>
							<div className='sidebar-newsletter-icon'>📬</div>
							<div className='sidebar-newsletter-title'>
								Get jobs in your inbox
							</div>
							<div className='sidebar-newsletter-sub'>
								New local jobs delivered every week with the
								WilCo Guide newsletter
							</div>
							<NewsletterSubscribeButton />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
