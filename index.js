import { LX } from 'lexgui';
import 'lexgui/extensions/codeeditor.js';
import 'lexgui/extensions/timeline.js';
import 'lexgui/extensions/audio.js';

window.LX = LX;

function requestFile( url, dataType, nocache ) {
    return new Promise( (resolve, reject) => {
        dataType = dataType ?? "arraybuffer";
        const mimeType = dataType === "arraybuffer" ? "application/octet-stream" : undefined;
        var xhr = new XMLHttpRequest();
        xhr.open( 'GET', url, true );
        xhr.responseType = dataType;
        if( mimeType )
            xhr.overrideMimeType( mimeType );
        if( nocache )
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.onload = function(load)
        {
            var response = this.response;
            if( this.status != 200)
            {
                var err = "Error " + this.status;
                reject(err);
                return;
            }
            resolve( response );
        };
        xhr.onerror = function(err) {
            reject(err);
        };
        xhr.send();
        return xhr;
    });
};

const area = await LX.init( { layoutMode: "document", rootClass: "wrapper" } );
const starterTheme = LX.getTheme();
const projects = JSON.parse( await requestFile( "projects.json", "text" ) );

// Menubar
{
    const menubar = area.addMenubar( [] );

    LX.addSignal( "@on_new_color_scheme", ( el, value ) => {
        // 
    } );

    menubar.addButtons( [
        {
            title: "Switch Theme",
            icon: starterTheme == "dark" ? "Moon" : "Sun",
            swap: starterTheme == "dark" ? "Sun" : "Moon",
            callback:  (value, event) => { LX.switchTheme() }
        },
        {
            title: "Switch Spacing",
            icon: "AlignVerticalSpaceAround",
            callback:  (value, event) => { LX.switchSpacing() }
        }
    ], { float: "center" });
}

// Header
{
    const header = LX.makeContainer( [ null, "auto" ], "flex flex-col border-top border-bottom gap-2 px-10 py-8", `
        <p class="fg-secondary" style="max-width:32rem">Software developer.</p>
        <h1 class="">Alejandro Rodríguez</h1>
        <p class="text-md leading-normal" style="max-width:48rem"> +8 years as a research and development engineer at Pompeu Fabra
        University, teaching roles in Computer Graphics and Game Development. Passionate about both coding and
        playing games. I'm eager to bring my skills to new challenges in software development, interactive applications,
        or computer graphics.</p>
    `, area );
}

// Content
{
    
    LX.makeContainer( [ "auto", "auto" ], "fg-primary px-8 pt-4 font-bold font-code text-xl", "Projects", area );

    const tabs = area.addTabs( { parentClass: "p-4", sizes: [ "auto", "auto" ], contentClass: "p-6 pt-0" } );

    const listProjects = ( type, container ) => {

        const listContainer = LX.makeContainer( ["100%", "auto"], "grid project-list gap-4 p-4 justify-center", "", container );

        for( const project of projects ?? [] )
        {
            if( project.type !== type )
            {
                continue;
            }

            const projectItem = LX.makeElement( "li", "project-item rounded-lg bg-secondary hover:bg-tertiary cursor-pointer overflow-hidden flex flex-col h-auto", "", listContainer );
            const projectPreview = LX.makeElement( "img", "rounded-t-lg bg-secondary hover:bg-tertiary w-full border-none", "", projectItem );
            projectPreview.src = project.preview ? `previews/${ project.preview }.png` : "previews/project_preview.png";
            const projectDesc = LX.makeContainer( ["100%", "100%"], "flex flex-row rounded-b-lg gap-6 p-4 items-center", `
                <div class="w-full">
                    <div class="text-lg font-bold"><span style="font-family:var(--global-code-font);">${ project.name }</span></div>
                    <div class="text-sm font-light fg-secondary"><span style="font-family:var(--global-code-font);">${ project.description ?? "" }</div>
                </div>`, projectItem );

            projectItem.addEventListener( "click", ( e ) => {
                window.open( project.url, "_blank" );
            } );
        }
    }

    {
        const graphicsProjects = LX.makeContainer( [ null, "800px" ], "flex flex-col bg-primary border rounded-lg overflow-scroll" );
        tabs.add( "Graphics", graphicsProjects, { selected: true } );
        listProjects( "graphics", graphicsProjects );
    }

    {
        const gameProjects = LX.makeContainer( [ null, "800px" ], "flex flex-col bg-primary border rounded-lg overflow-scroll" );
        tabs.add( "Games", gameProjects, { xselected: true } );
        listProjects( "game", gameProjects );
    }

    {
        const webProjects = LX.makeContainer( [ "auto", "800px" ], "flex flex-col bg-primary border rounded-lg overflow-scroll" );
        tabs.add( "Web", webProjects );
        listProjects( "web", webProjects );
    }
}

// Footer
{
    const footer = new LX.Footer( {
        className: "border-top",
        parent: LX.root,
        columns: [
            {
                title: "LexGUI",
                items: [
                    { title: "Source code on Github", link: "https://github.com/jxarco/lexgui.js/" }
                ]
            },
            {
                title: "Projects",
                items: [
                    { title: "Animics", link: "https://animics.gti.upf.edu/" },
                    { title: "Performs", link: "https://performs.gti.upf.edu/" }
                ]
            },
            {
                title: "References",
                items: [
                    { title: "shadcn/ui", link: "https://ui.shadcn.com/" },
                    { title: "Radix UI", link: "https://www.radix-ui.com/" },
                ]
            }
        ],
        credits: `2019-${ new Date().getUTCFullYear() } Alex Rodríguez and contributors. Website source code on GitHub.`,
        socials: [
            { title: "Github", link: "https://github.com/jxarco/lexgui.js/", icon: "Github" },
            { title: "Discord", link: "https://discord.gg/vwqVrMZBXv", icon: "Discord" }
        ]
    } );
}